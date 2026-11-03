"""Mathematical logic ops (``logic.*``).

Implements the exact formula syntax from docs/API.md §logic:

- propositional: ``~ & | -> <-> T F``, atoms ``[A-Za-z_][A-Za-z0-9_']*``
- first-order: ``forall x.``, ``exists x.``, ``P(x)``, ``f(x,y)``, ``=``
- modal: propositional plus ``[]``/``<>``, frames ``K|T|S4|S5``
- unicode aliases ``¬ ∧ ∨ → ↔ ∀ ∃ □ ◇``

The AST is a JSON object tree; every node has a ``type`` field.  Propositional
proof search is classical natural deduction built from a semantic case split;
the returned proof tree and Fitch lines only use the rule names listed in the
API contract (plus ``true-intro`` for the constant ⊤).
"""

from __future__ import annotations

import itertools

from mlcore import EngineError, bad_request, domain, limit_error, text, truncate

# ---------------------------------------------------------------------------
# Limits
# ---------------------------------------------------------------------------

MAX_TRUTH_ATOMS = 12
MAX_PROOF_ATOMS = 6
MAX_TRUTH_ROWS = 4096
MAX_RESOLUTION_CLAUSES = 2000
MAX_RESOLUTION_STEPS = 5000
MAX_FOL_STRUCTURES = 250_000
MAX_MODAL_MODELS = 250_000
MAX_DIAGRAM_WORLDS = 4

LOGIC_ALIASES = {
    "prop": "prop",
    "propositional": "prop",
    "pl": "prop",
    "fol": "fol",
    "first-order": "fol",
    "firstorder": "fol",
    "first_order": "fol",
    "modal": "modal",
}

TRUE_NODE = {"type": "true"}
FALSE_NODE = {"type": "false"}


class FormulaError(ValueError):
    """Raised for malformed formula input."""


def parse_error(message: str) -> EngineError:
    return EngineError("parse-error", message)


# ---------------------------------------------------------------------------
# Tokenizer
# ---------------------------------------------------------------------------

_TOKEN_SPECS = [
    ("IFF", "<->"),
    ("IMP", "->"),
    ("BOX", "[]"),
    ("DIAMOND", "<>"),
    ("AND", "&"),
    ("OR", "|"),
    ("NOT", "~"),
    ("LPAREN", "("),
    ("RPAREN", ")"),
    ("COMMA", ","),
    ("DOT", "."),
    ("EQ", "="),
    ("UNICODE", "¬"),
    ("UNICODE", "∧"),
    ("UNICODE", "∨"),
    ("UNICODE", "→"),
    ("UNICODE", "↔"),
    ("UNICODE", "∀"),
    ("UNICODE", "∃"),
    ("UNICODE", "□"),
    ("UNICODE", "◇"),
]

_UNICODE_MAP = {
    "¬": "NOT",
    "∧": "AND",
    "∨": "OR",
    "→": "IMP",
    "↔": "IFF",
    "∀": "FORALL",
    "∃": "EXISTS",
    "□": "BOX",
    "◇": "DIAMOND",
}

_STARTERS = "<>~¬∧∨→↔∀∃□◇(&|"


def tokenize(source: str) -> list[tuple[str, str]]:
    if not isinstance(source, str):
        raise FormulaError("formula must be a string")
    if not source.strip():
        raise FormulaError("formula is empty")
    if len(source) > 4000:
        raise FormulaError("formula is too long (max 4000 characters)")
    tokens: list[tuple[str, str]] = []
    index = 0
    length = len(source)
    while index < length:
        character = source[index]
        if character.isspace():
            index += 1
            continue
        if character in _UNICODE_MAP:
            tokens.append((_UNICODE_MAP[character], character))
            index += 1
            continue
        matched = False
        for kind, literal in _TOKEN_SPECS:
            if kind == "UNICODE":
                continue
            if source.startswith(literal, index):
                tokens.append((kind, literal))
                index += len(literal)
                matched = True
                break
        if matched:
            continue
        if character.isalpha() or character == "_":
            start = index
            index += 1
            while index < length and (source[index].isalnum() or source[index] in "_'"):
                index += 1
            word = source[start:index]
            lowered = word.lower()
            if lowered == "forall":
                tokens.append(("FORALL", word))
            elif lowered == "exists":
                tokens.append(("EXISTS", word))
            elif word == "T":
                tokens.append(("TRUE", word))
            elif word == "F":
                tokens.append(("FALSE", word))
            else:
                tokens.append(("IDENT", word))
            continue
        raise FormulaError(f"unexpected character {character!r} at position {index + 1}")
    tokens.append(("END", ""))
    return tokens


# ---------------------------------------------------------------------------
# Parser
# ---------------------------------------------------------------------------


class Parser:
    def __init__(self, tokens: list[tuple[str, str]], logic: str):
        self.tokens = tokens
        self.index = 0
        self.logic = logic
        self.bound_vars: list[set[str]] = []
        self.saw_fol = False
        self.saw_modal = False

    # -- token helpers ------------------------------------------------------
    def peek(self) -> str:
        return self.tokens[self.index][0]

    def peek_literal(self) -> str:
        return self.tokens[self.index][1]

    def advance(self) -> tuple[str, str]:
        token = self.tokens[self.index]
        self.index += 1
        return token

    def expect(self, kind: str) -> tuple[str, str]:
        if self.peek() != kind:
            found = self.tokens[self.index][1] or self.peek()
            raise FormulaError(f"expected {kind} but found {found!r}")
        return self.advance()

    # -- grammar ------------------------------------------------------------
    def parse(self) -> dict:
        formula = self.parse_iff()
        if self.peek() != "END":
            raise FormulaError(f"unexpected token {self.peek_literal()!r}")
        return formula

    def parse_iff(self) -> dict:
        left = self.parse_imp()
        while self.peek() == "IFF":
            self.advance()
            right = self.parse_imp()
            left = {"type": "iff", "left": left, "right": right}
        return left

    def parse_imp(self) -> dict:
        left = self.parse_or()
        if self.peek() == "IMP":
            self.advance()
            right = self.parse_imp()  # right associative
            return {"type": "imp", "left": left, "right": right}
        return left

    def parse_or(self) -> dict:
        left = self.parse_and()
        while self.peek() == "OR":
            self.advance()
            right = self.parse_and()
            left = {"type": "or", "left": left, "right": right}
        return left

    def parse_and(self) -> dict:
        left = self.parse_unary()
        while self.peek() == "AND":
            self.advance()
            right = self.parse_unary()
            left = {"type": "and", "left": left, "right": right}
        return left

    def parse_unary(self) -> dict:
        kind = self.peek()
        if kind == "NOT":
            self.advance()
            return {"type": "not", "arg": self.parse_unary()}
        if kind == "BOX":
            self.advance()
            self.saw_modal = True
            return {"type": "box", "arg": self.parse_unary()}
        if kind == "DIAMOND":
            self.advance()
            self.saw_modal = True
            return {"type": "diamond", "arg": self.parse_unary()}
        if kind in ("FORALL", "EXISTS"):
            return self.parse_quantifier()
        return self.parse_atom()

    def parse_quantifier(self) -> dict:
        kind = self.advance()[0]
        _, name = self.expect("IDENT")
        self.expect("DOT")
        self.saw_fol = True
        if self.logic != "fol":
            # parsed for error reporting; validity is rejected later
            pass
        self.bound_vars.append({name})
        body = self.parse_iff()
        self.bound_vars.pop()
        return {"type": "forall" if kind == "FORALL" else "exists", "var": name, "body": body}

    def _is_bound(self, name: str) -> bool:
        return any(name in scope for scope in reversed(self.bound_vars))

    def parse_atom(self) -> dict:
        kind = self.peek()
        if kind == "LPAREN":
            self.advance()
            formula = self.parse_iff()
            self.expect("RPAREN")
            return formula
        if kind == "TRUE":
            self.advance()
            return dict(TRUE_NODE)
        if kind == "FALSE":
            self.advance()
            return dict(FALSE_NODE)
        if kind == "IDENT":
            _, name = self.advance()
            if self.logic == "fol":
                if self.peek() == "LPAREN":
                    self.advance()
                    args = self.parse_term_list()
                    self.expect("RPAREN")
                    return {"type": "pred", "name": name, "args": args}
                if self.peek() == "EQ":
                    self.advance()
                    left = {"type": "var", "name": name} if self._is_bound(name) else {"type": "const", "name": name}
                    right = self.parse_term()
                    return {"type": "eq", "left": left, "right": right}
                return {"type": "pred", "name": name, "args": []}
            if self.peek() == "LPAREN":
                raise FormulaError(
                    f"predicate application {name}(...) needs logic='fol'"
                )
            return {"type": "atom", "name": name}
        found = self.peek_literal() or self.peek()
        raise FormulaError(f"expected a formula but found {found!r}")

    def parse_term_list(self) -> list[dict]:
        terms = [self.parse_term()]
        while self.peek() == "COMMA":
            self.advance()
            terms.append(self.parse_term())
        return terms

    def parse_term(self) -> dict:
        kind, value = self.tokens[self.index]
        if kind == "IDENT":
            self.advance()
            if self.peek() == "LPAREN":
                self.advance()
                args = self.parse_term_list()
                self.expect("RPAREN")
                return {"type": "func", "name": value, "args": args}
            if self._is_bound(value):
                return {"type": "var", "name": value}
            return {"type": "const", "name": value}
        raise FormulaError(f"expected a term but found {value or kind!r}")


def _parse_formula(source: str, logic: str) -> dict:
    tokens = tokenize(source)
    ast = Parser(tokens, logic).parse()
    _validate_logic(ast, logic)
    return ast


def _validate_logic(ast: dict, logic: str) -> None:
    types = {node["type"] for node in walk_ast(ast)}
    if logic == "prop":
        forbidden = types & {"forall", "exists", "pred", "eq", "box", "diamond"}
        if forbidden:
            raise FormulaError(
                "formula uses first-order/modal constructs but logic='prop': "
                + ", ".join(sorted(forbidden))
            )
    elif logic == "fol":
        forbidden = types & {"atom", "box", "diamond"}
        if forbidden:
            raise FormulaError(
                "formula uses propositional/modal constructs but logic='fol': "
                + ", ".join(sorted(forbidden))
            )
    elif logic == "modal":
        forbidden = types & {"forall", "exists", "pred", "eq"}
        if forbidden:
            raise FormulaError(
                "formula uses first-order constructs but logic='modal': "
                + ", ".join(sorted(forbidden))
            )


def walk_ast(ast: dict):
    yield ast
    node_type = ast["type"]
    if node_type in ("not", "box", "diamond"):
        yield from walk_ast(ast["arg"])
    elif node_type in ("and", "or", "imp", "iff"):
        yield from walk_ast(ast["left"])
        yield from walk_ast(ast["right"])
    elif node_type in ("forall", "exists"):
        yield from walk_ast(ast["body"])
    elif node_type == "pred":
        for argument in ast["args"]:
            yield from walk_term(argument)
    elif node_type == "eq":
        yield from walk_term(ast["left"])
        yield from walk_term(ast["right"])


def walk_term(term: dict):
    yield term
    for argument in term.get("args", []):
        yield from walk_term(argument)


# ---------------------------------------------------------------------------
# Pretty / LaTeX rendering
# ---------------------------------------------------------------------------

_PREC = {"iff": 1, "imp": 2, "or": 3, "and": 4, "not": 5, "atom": 6,
         "pred": 6, "eq": 6, "true": 6, "false": 6,
         "forall": 0, "exists": 0, "box": 6, "diamond": 6}
_SYMBOLS = {"and": " & ", "or": " | ", "imp": " -> ", "iff": " <-> "}


def to_pretty(ast: dict) -> str:
    return _pretty(ast, 0)


def _pretty(ast: dict, parent_prec: int) -> str:
    node_type = ast["type"]
    if node_type == "atom":
        return ast["name"]
    if node_type == "pred":
        if not ast["args"]:
            return ast["name"]
        return ast["name"] + "(" + ", ".join(_term_pretty(term) for term in ast["args"]) + ")"
    if node_type == "eq":
        return _term_pretty(ast["left"]) + " = " + _term_pretty(ast["right"])
    if node_type == "true":
        return "T"
    if node_type == "false":
        return "F"
    if node_type == "not":
        inner = _pretty(ast["arg"], _PREC["not"])
        return "~" + inner
    if node_type in ("and", "or", "imp", "iff"):
        prec = _PREC[node_type]
        left = _pretty(ast["left"], prec + (1 if node_type in ("imp", "iff") else 0))
        right = _pretty(ast["right"], prec)
        rendered = left + _SYMBOLS[node_type] + right
        if prec < parent_prec:
            return "(" + rendered + ")"
        return rendered
    if node_type in ("box", "diamond"):
        symbol = "[]" if node_type == "box" else "<>"
        inner = _pretty(ast["arg"], _PREC["not"])
        return symbol + inner
    if node_type in ("forall", "exists"):
        keyword = "forall" if node_type == "forall" else "exists"
        return f"{keyword} {ast['var']}. " + _pretty(ast["body"], 0)
    return "?"


def _term_pretty(term: dict) -> str:
    if term["type"] in ("var", "const"):
        return term["name"]
    if term["type"] == "func":
        return term["name"] + "(" + ", ".join(_term_pretty(argument) for argument in term["args"]) + ")"
    return "?"


def to_latex(ast: dict) -> str:
    return _latex(ast)


def _latex(ast: dict) -> str:
    node_type = ast["type"]
    if node_type == "atom":
        return "\\mathrm{" + ast["name"].replace("'", "^{\\prime}") + "}"
    if node_type == "pred":
        name = "\\mathrm{" + ast["name"] + "}"
        if not ast["args"]:
            return name
        return name + "(" + ", ".join(_term_latex(term) for term in ast["args"]) + ")"
    if node_type == "eq":
        return _term_latex(ast["left"]) + " = " + _term_latex(ast["right"])
    if node_type == "true":
        return "\\top"
    if node_type == "false":
        return "\\bot"
    if node_type == "not":
        return "\\neg " + _latex(ast["arg"])
    if node_type == "and":
        return "\\left(" + _latex(ast["left"]) + " \\land " + _latex(ast["right"]) + "\\right)"
    if node_type == "or":
        return "\\left(" + _latex(ast["left"]) + " \\lor " + _latex(ast["right"]) + "\\right)"
    if node_type == "imp":
        return "\\left(" + _latex(ast["left"]) + " \\to " + _latex(ast["right"]) + "\\right)"
    if node_type == "iff":
        return "\\left(" + _latex(ast["left"]) + " \\leftrightarrow " + _latex(ast["right"]) + "\\right)"
    if node_type == "box":
        return "\\Box " + _latex(ast["arg"])
    if node_type == "diamond":
        return "\\Diamond " + _latex(ast["arg"])
    if node_type in ("forall", "exists"):
        symbol = "\\forall" if node_type == "forall" else "\\exists"
        return symbol + " " + _latex_var(ast["var"]) + "\\, " + _latex(ast["body"])
    return "?"


def _latex_var(name: str) -> str:
    return "\\mathit{" + name + "}"


def _term_latex(term: dict) -> str:
    if term["type"] in ("var", "const"):
        return "\\mathrm{" + term["name"] + "}"
    if term["type"] == "func":
        return "\\mathrm{" + term["name"] + "}(" + ", ".join(_term_latex(arg) for arg in term["args"]) + ")"
    return "?"


# ---------------------------------------------------------------------------
# Atoms / free variables
# ---------------------------------------------------------------------------


def atoms_of(ast: dict) -> list[str]:
    names = set()
    for node in walk_ast(ast):
        if node["type"] == "atom":
            names.add(node["name"])
    return sorted(names)


def predicates_of(ast: dict) -> dict[str, int]:
    predicates: dict[str, int] = {}
    for node in walk_ast(ast):
        if node["type"] == "pred":
            arity = len(node["args"])
            if node["name"] in predicates and predicates[node["name"]] != arity:
                raise FormulaError(f"predicate {node['name']!r} used with different arities")
            predicates[node["name"]] = arity
    return predicates


def functions_of(ast: dict) -> dict[str, int]:
    functions: dict[str, int] = {}
    for node in walk_ast(ast):
        if node["type"] == "pred":
            for term in node["args"]:
                _collect_functions(term, functions)
        elif node["type"] == "eq":
            _collect_functions(ast["left"], functions)
            _collect_functions(ast["right"], functions)
    return functions


def _collect_functions(term: dict, functions: dict[str, int]) -> None:
    if term["type"] == "func":
        arity = len(term["args"])
        if functions.get(term["name"], arity) != arity:
            raise FormulaError(f"function {term['name']!r} used with different arities")
        functions[term["name"]] = arity
        for argument in term["args"]:
            _collect_functions(argument, functions)


def constants_of(ast: dict) -> list[str]:
    constants = set()
    bound: list[set[str]] = []

    def visit(node):
        node_type = node["type"]
        if node_type == "quantifier":
            return
        if node_type in ("forall", "exists"):
            bound.append({node["var"]})
            visit(node["body"])
            bound.pop()
        elif node_type in ("not", "box", "diamond"):
            visit(node["arg"])
        elif node_type in ("and", "or", "imp", "iff"):
            visit(node["left"])
            visit(node["right"])
        elif node_type == "pred":
            for term in node["args"]:
                visit_term(term)
        elif node_type == "eq":
            visit_term(node["left"])
            visit_term(node["right"])

    def visit_term(term):
        if term["type"] == "const":
            constants.add(term["name"])
        elif term["type"] == "func":
            for argument in term["args"]:
                visit_term(argument)

    visit(ast)
    return sorted(constants)


def free_vars_of(ast: dict) -> list[str]:
    """Identifiers used as terms without an enclosing quantifier (FOL)."""
    return constants_of(ast)


# ---------------------------------------------------------------------------
# Propositional evaluation
# ---------------------------------------------------------------------------


def eval_prop(ast: dict, assignment: dict[str, bool]) -> bool:
    node_type = ast["type"]
    if node_type == "atom":
        return bool(assignment.get(ast["name"], False))
    if node_type == "true":
        return True
    if node_type == "false":
        return False
    if node_type == "not":
        return not eval_prop(ast["arg"], assignment)
    if node_type == "and":
        return eval_prop(ast["left"], assignment) and eval_prop(ast["right"], assignment)
    if node_type == "or":
        return eval_prop(ast["left"], assignment) or eval_prop(ast["right"], assignment)
    if node_type == "imp":
        return (not eval_prop(ast["left"], assignment)) or eval_prop(ast["right"], assignment)
    if node_type == "iff":
        return eval_prop(ast["left"], assignment) == eval_prop(ast["right"], assignment)
    raise ValueError(f"not a propositional formula: {node_type}")


def truth_rows(goal: dict, atoms: list[str]) -> list[dict]:
    rows = []
    for values in itertools.product([False, True], repeat=len(atoms)):
        assignment = dict(zip(atoms, values))
        rows.append({"assignment": assignment, "values": list(values), "result": eval_prop(goal, assignment)})
    return rows


# ---------------------------------------------------------------------------
# CNF / DNF strings from a truth table
# ---------------------------------------------------------------------------


def _literal(atom: str, positive: bool) -> str:
    return atom if positive else "~" + atom


def dnf_string(atoms: list[str], rows: list[dict]) -> str:
    true_rows = [row for row in rows if row["result"]]
    if not true_rows:
        return "F"
    if len(true_rows) == len(rows):
        return "T"
    terms = []
    for row in true_rows:
        literals = [_literal(atom, row["assignment"][atom]) for atom in atoms]
        terms.append("(" + " & ".join(literals) + ")" if len(literals) > 1 else literals[0])
    return " | ".join(terms)


def cnf_string(atoms: list[str], rows: list[dict]) -> str:
    false_rows = [row for row in rows if not row["result"]]
    if not false_rows:
        return "T"
    if len(false_rows) == len(rows):
        return "F"
    clauses = []
    for row in false_rows:
        literals = [_literal(atom, not row["assignment"][atom]) for atom in atoms]
        clauses.append("(" + " | ".join(literals) + ")" if len(literals) > 1 else literals[0])
    return " & ".join(clauses)


# ---------------------------------------------------------------------------
# Propositional natural deduction proof search (classical)
# ---------------------------------------------------------------------------

_RULE_NAMES = [
    "assumption", "reiteration", "and-intro", "and-elim-l", "and-elim-r",
    "or-intro-l", "or-intro-r", "or-elim", "imp-intro", "imp-elim",
    "iff-intro", "iff-elim-l", "iff-elim-r", "not-intro", "not-elim",
    "contradiction-elim", "double-neg-elim", "law-excluded-middle",
    "true-intro",
]


class ProofBuilder:
    def __init__(self):
        self.nodes: list[dict] = []
        self.counter = 0

    def add(self, rule: str, conclusion: dict, indent: int, premises=(), discharged=()) -> str:
        node_id = f"p{self.counter}"
        self.counter += 1
        self.nodes.append(
            {
                "id": node_id,
                "rule": rule,
                "conclusion_ast": conclusion,
                "conclusion": to_pretty(conclusion),
                "premises": list(premises),
                "discharged": list(discharged),
                "indent": int(indent),
                "line": 0,
            }
        )
        return node_id

    def node(self, node_id: str) -> dict:
        for node in self.nodes:
            if node["id"] == node_id:
                return node
        raise KeyError(node_id)

    def finalize(self) -> tuple[list[dict], list[dict]]:
        output = []
        fitch = []
        for line, node in enumerate(self.nodes, start=1):
            node["line"] = line
            output.append(
                {
                    "id": node["id"],
                    "rule": node["rule"],
                    "conclusion": node["conclusion"],
                    "premises": node["premises"],
                    "discharged": node["discharged"],
                    "fitch": {
                        "line": line,
                        "indent": node["indent"],
                        "text": node["conclusion"],
                        "rule": node["rule"],
                        "conclusion": node["conclusion"],
                        "refs": node["premises"],
                    },
                }
            )
            fitch.append(
                {
                    "line": line,
                    "indent": node["indent"],
                    "text": node["conclusion"],
                    "rule": node["rule"],
                    "conclusion": node["conclusion"],
                    "refs": node["premises"],
                }
            )
        return output, fitch


class NDProver:
    """Classical propositional natural deduction via exhaustive case splits."""

    def __init__(self, premises: list[dict], goal: dict):
        self.premises = premises
        self.goal = goal
        self.builder = ProofBuilder()
        self.assignment_nodes: dict[str, dict[str, str]] = {"true": {}, "false": {}}
        self.assigned: dict[str, bool] = {}

    # -- basic building blocks ---------------------------------------------
    def _assume(self, formula: dict, indent: int) -> str:
        return self.builder.add("assumption", formula, indent)

    def _reiterate(self, node_id: str, indent: int) -> str:
        formula = self.builder.node(node_id)["conclusion_ast"]
        return self.builder.add("reiteration", formula, indent, premises=[node_id])

    def _contradiction(self, p_node: str, not_p_node: str, indent: int) -> str:
        return self.builder.add("contradiction-elim", dict(FALSE_NODE), indent, premises=[p_node, not_p_node])

    def _explode(self, contradiction_node: str, target: dict, indent: int) -> str:
        return self.builder.add("contradiction-elim", target, indent, premises=[contradiction_node])

    def _not_intro(self, assumption_id: str, contradiction_node: str | None, formula: dict, indent: int) -> str:
        premises = [contradiction_node] if contradiction_node else []
        return self.builder.add(
            "not-intro",
            {"type": "not", "arg": formula},
            indent,
            premises=premises,
            discharged=[assumption_id],
        )

    # -- literal lookup -----------------------------------------------------
    def _node_for(self, atom: str, value: bool, indent: int) -> str:
        table = self.assignment_nodes["true" if value else "false"]
        node_id = table.get(atom)
        if node_id is None:  # pragma: no cover - assignment is total by construction
            raise RuntimeError(f"internal: no assumption for {atom}={value}")
        return self._reiterate(node_id, indent)

    # -- semantic derivation -------------------------------------------------
    def derive(self, formula: dict, indent: int) -> str:
        """Return a node proving ``formula`` if it is true under the assignment,
        otherwise a node proving ``~formula``."""
        node_type = formula["type"]
        value = eval_prop(formula, self.assigned)
        if node_type == "atom":
            return self._node_for(formula["name"], value, indent)
        if node_type == "true":
            if not value:  # pragma: no cover - impossible
                raise RuntimeError("internal: T evaluated false")
            return self.builder.add("true-intro", dict(TRUE_NODE), indent)
        if node_type == "false":
            # derive ~F : assume F, the assumption itself is the contradiction
            assumption_id = self._assume(dict(FALSE_NODE), indent + 1)
            return self.builder.add(
                "not-intro",
                {"type": "not", "arg": dict(FALSE_NODE)},
                indent,
                premises=[assumption_id],
                discharged=[assumption_id],
            )
        if node_type == "not":
            inner = formula["arg"]
            if value:  # inner is false: derive(inner) itself proves ~inner
                return self.derive(inner, indent)
            # inner is true; the target is ~(~inner)
            inner_node = self.derive(inner, indent)
            assumption_id = self._assume(formula, indent + 1)
            contradiction = self._contradiction(inner_node, assumption_id, indent + 1)
            return self._not_intro(assumption_id, contradiction, formula, indent)
        if node_type == "and":
            if value:
                left_node = self.derive(formula["left"], indent)
                right_node = self.derive(formula["right"], indent)
                return self.builder.add("and-intro", formula, indent, premises=[left_node, right_node])
            false_side = "left" if not eval_prop(formula["left"], self.assigned) else "right"
            false_formula = formula[false_side]
            false_node = self.derive(false_formula, indent)
            assumption_id = self._assume(formula, indent + 1)
            elim_rule = "and-elim-l" if false_side == "left" else "and-elim-r"
            part_node = self.builder.add(elim_rule, false_formula, indent + 1, premises=[assumption_id])
            contradiction = self._contradiction(part_node, false_node, indent + 1)
            return self._not_intro(assumption_id, contradiction, formula, indent)
        if node_type == "or":
            if value:
                true_side = "left" if eval_prop(formula["left"], self.assigned) else "right"
                true_formula = formula[true_side]
                part_node = self.derive(true_formula, indent)
                rule = "or-intro-l" if true_side == "left" else "or-intro-r"
                return self.builder.add(rule, formula, indent, premises=[part_node])
            left_not_node = self.derive(formula["left"], indent)
            right_not_node = self.derive(formula["right"], indent)
            assumption_id = self._assume(formula, indent + 1)
            left_assumption = self._assume(formula["left"], indent + 2)
            left_contradiction = self._contradiction(left_assumption, left_not_node, indent + 2)
            right_assumption = self._assume(formula["right"], indent + 2)
            right_contradiction = self._contradiction(right_assumption, right_not_node, indent + 2)
            elim_node = self.builder.add(
                "or-elim",
                dict(FALSE_NODE),
                indent + 1,
                premises=[assumption_id, left_contradiction, right_contradiction],
                discharged=[left_assumption, right_assumption],
            )
            return self._not_intro(assumption_id, elim_node, formula, indent)
        if node_type == "imp":
            left_value = eval_prop(formula["left"], self.assigned)
            right_value = eval_prop(formula["right"], self.assigned)
            if value:
                if not left_value:
                    left_not_node = self.derive(formula["left"], indent)
                    assumption_id = self._assume(formula["left"], indent + 1)
                    contradiction = self._contradiction(assumption_id, left_not_node, indent + 1)
                    right_node = self._explode(contradiction, formula["right"], indent + 1)
                else:
                    assumption_id = self._assume(formula["left"], indent + 1)
                    right_node = self.derive(formula["right"], indent + 1)
                    right_node = self._reiterate(right_node, indent + 1)
                return self.builder.add(
                    "imp-intro", formula, indent, premises=[right_node], discharged=[assumption_id]
                )
            left_node = self.derive(formula["left"], indent)
            right_not_node = self.derive(formula["right"], indent)
            assumption_id = self._assume(formula, indent + 1)
            elim_node = self.builder.add("imp-elim", formula["right"], indent + 1, premises=[assumption_id, left_node])
            contradiction = self._contradiction(elim_node, right_not_node, indent + 1)
            return self._not_intro(assumption_id, contradiction, formula, indent)
        if node_type == "iff":
            left_value = eval_prop(formula["left"], self.assigned)
            right_value = eval_prop(formula["right"], self.assigned)
            if value:
                if left_value:
                    left_node = self.derive(formula["left"], indent)
                    right_node = self.derive(formula["right"], indent)
                    forward_assumption = self._assume(formula["left"], indent + 1)
                    right_reit = self._reiterate(right_node, indent + 1)
                    forward = self.builder.add(
                        "imp-intro",
                        {"type": "imp", "left": formula["left"], "right": formula["right"]},
                        indent,
                        premises=[right_reit],
                        discharged=[forward_assumption],
                    )
                    backward_assumption = self._assume(formula["right"], indent + 1)
                    left_reit = self._reiterate(left_node, indent + 1)
                    backward = self.builder.add(
                        "imp-intro",
                        {"type": "imp", "left": formula["right"], "right": formula["left"]},
                        indent,
                        premises=[left_reit],
                        discharged=[backward_assumption],
                    )
                else:
                    left_not_node = self.derive(formula["left"], indent)
                    right_not_node = self.derive(formula["right"], indent)
                    forward_assumption = self._assume(formula["left"], indent + 1)
                    contradiction = self._contradiction(forward_assumption, left_not_node, indent + 1)
                    right_node = self._explode(contradiction, formula["right"], indent + 1)
                    forward = self.builder.add(
                        "imp-intro",
                        {"type": "imp", "left": formula["left"], "right": formula["right"]},
                        indent,
                        premises=[right_node],
                        discharged=[forward_assumption],
                    )
                    backward_assumption = self._assume(formula["right"], indent + 1)
                    contradiction2 = self._contradiction(backward_assumption, right_not_node, indent + 1)
                    left_node = self._explode(contradiction2, formula["left"], indent + 1)
                    backward = self.builder.add(
                        "imp-intro",
                        {"type": "imp", "left": formula["right"], "right": formula["left"]},
                        indent,
                        premises=[left_node],
                        discharged=[backward_assumption],
                    )
                return self.builder.add("iff-intro", formula, indent, premises=[forward, backward])
            left_value = eval_prop(formula["left"], self.assigned)
            assumption_id = self._assume(formula, indent + 1)
            if left_value:
                left_node = self.derive(formula["left"], indent)
                right_not_node = self.derive(formula["right"], indent)
                elim_node = self.builder.add(
                    "iff-elim-l", formula["right"], indent + 1, premises=[assumption_id, left_node]
                )
                contradiction = self._contradiction(elim_node, right_not_node, indent + 1)
            else:
                right_node = self.derive(formula["right"], indent)
                left_not_node = self.derive(formula["left"], indent)
                elim_node = self.builder.add(
                    "iff-elim-r", formula["left"], indent + 1, premises=[assumption_id, right_node]
                )
                contradiction = self._contradiction(elim_node, left_not_node, indent + 1)
            return self._not_intro(assumption_id, contradiction, formula, indent)
        raise ValueError(f"unsupported formula node: {node_type}")

    def _derive_negation_direct(self, inner: dict, indent: int) -> str:
        # inner is false: derive ~inner structurally (used only for the not-of-atom
        # shortcut above)
        return self.derive(inner, indent)


def _validate_prop_formula(ast: dict, what: str) -> None:
    for node in walk_ast(ast):
        if node["type"] in ("forall", "exists", "pred", "eq", "box", "diamond"):
            raise bad_request(f"{what} must be a propositional formula (found {node['type']})")


def _prop_semantics(premises: list[dict], goal: dict):
    atoms = sorted({atom for premise in premises for atom in atoms_of(premise)} | set(atoms_of(goal)))
    if len(atoms) > MAX_TRUTH_ATOMS:
        raise limit_error(f"too many propositional atoms ({len(atoms)} > {MAX_TRUTH_ATOMS})")
    rows = []
    for values in itertools.product([False, True], repeat=len(atoms)):
        assignment = dict(zip(atoms, values))
        rows.append(
            {
                "assignment": assignment,
                "values": list(values),
                "premises": [eval_prop(premise, assignment) for premise in premises],
                "result": eval_prop(goal, assignment),
            }
        )
    valid = all(
        (not all(row["premises"])) or row["result"] for row in rows
    )
    countermodel = None
    if not valid:
        for row in rows:
            if all(row["premises"]) and not row["result"]:
                countermodel = {"assignment": {name: row["assignment"][name] for name in atoms}}
                break
    return atoms, rows, valid, countermodel


def _build_proof(premises: list[dict], goal: dict):
    atoms = sorted({atom for premise in premises for atom in atoms_of(premise)} | set(atoms_of(goal)))
    if len(atoms) > MAX_PROOF_ATOMS:
        return None, None, None, (
            f"proof tree omitted: {len(atoms)} atoms would exceed the case-split budget "
            f"of {MAX_PROOF_ATOMS}"
        )
    prover = NDProver(premises, goal)
    premise_nodes = [prover._assume(premise, 0) for premise in premises]
    prover.premise_nodes = premise_nodes

    def branch(remaining_atoms, indent: int) -> str:
        if not remaining_atoms:
            prover.assigned = {}
            # reconstruct the assignment from the assumption tables
            for atom, node_id in prover.assignment_nodes["true"].items():
                prover.assigned[atom] = True
            for atom, node_id in prover.assignment_nodes["false"].items():
                prover.assigned[atom] = False
            for index, premise in enumerate(premises):
                if not eval_prop(premise, prover.assigned):
                    premise_node = premise_nodes[index]
                    premise_negation = prover.derive(premise, indent)
                    contradiction = prover._contradiction(premise_node, premise_negation, indent)
                    return prover._explode(contradiction, goal, indent)
            return prover.derive(goal, indent)
        atom = remaining_atoms[0]
        atom_formula = {"type": "atom", "name": atom}
        not_atom = {"type": "not", "arg": atom_formula}
        lem_node = prover.builder.add(
            "law-excluded-middle",
            {"type": "or", "left": atom_formula, "right": dict(not_atom)},
            indent,
        )
        assume_true = prover._assume(atom_formula, indent + 1)
        prover.assignment_nodes["true"][atom] = assume_true
        true_branch = branch(remaining_atoms[1:], indent + 1)
        prover.assignment_nodes["true"].pop(atom, None)
        assume_false = prover._assume(not_atom, indent + 1)
        prover.assignment_nodes["false"][atom] = assume_false
        false_branch = branch(remaining_atoms[1:], indent + 1)
        prover.assignment_nodes["false"].pop(atom, None)
        return prover.builder.add(
            "or-elim",
            goal,
            indent,
            premises=[lem_node, true_branch, false_branch],
            discharged=[assume_true, assume_false],
        )

    root_id = branch(atoms, 0)
    nodes, fitch = prover.builder.finalize()
    root = next(node for node in nodes if node["id"] == root_id)
    return root, nodes, fitch, None


# ---------------------------------------------------------------------------
# Resolution
# ---------------------------------------------------------------------------


def _nnf(ast: dict, negate: bool = False) -> dict:
    node_type = ast["type"]
    if node_type == "not":
        return _nnf(ast["arg"], not negate)
    if node_type == "atom":
        return {"type": "atom", "name": ast["name"]} if not negate else {"type": "not", "arg": {"type": "atom", "name": ast["name"]}}
    if node_type == "true":
        return dict(FALSE_NODE) if negate else dict(TRUE_NODE)
    if node_type == "false":
        return dict(TRUE_NODE) if negate else dict(FALSE_NODE)
    if node_type == "and":
        if negate:
            return {"type": "or", "left": _nnf(ast["left"], True), "right": _nnf(ast["right"], True)}
        return {"type": "and", "left": _nnf(ast["left"]), "right": _nnf(ast["right"])}
    if node_type == "or":
        if negate:
            return {"type": "and", "left": _nnf(ast["left"], True), "right": _nnf(ast["right"], True)}
        return {"type": "or", "left": _nnf(ast["left"]), "right": _nnf(ast["right"])}
    if node_type == "imp":
        expanded = {"type": "or", "left": {"type": "not", "arg": ast["left"]}, "right": ast["right"]}
        return _nnf(expanded, negate)
    if node_type == "iff":
        left = ast["left"]
        right = ast["right"]
        expanded = {
            "type": "and",
            "left": {"type": "or", "left": {"type": "not", "arg": left}, "right": right},
            "right": {"type": "or", "left": {"type": "not", "arg": right}, "right": left},
        }
        return _nnf(expanded, negate)
    raise ValueError(f"resolution needs propositional formulas (found {node_type})")


def _cnf_clauses(ast: dict) -> list[list[tuple[str, bool]]]:
    nnf = _nnf(ast)

    def to_cnf(node) -> list[list[tuple[str, bool]]]:
        node_type = node["type"]
        if node_type == "true":
            return []
        if node_type == "false":
            return [[]]
        if node_type == "atom":
            return [[(node["name"], True)]]
        if node_type == "not":
            inner = node["arg"]
            if inner["type"] == "atom":
                return [[(inner["name"], False)]]
            raise ValueError("negation did not reach a literal")
        if node_type == "and":
            return to_cnf(node["left"]) + to_cnf(node["right"])
        if node_type == "or":
            left = to_cnf(node["left"])
            right = to_cnf(node["right"])
            merged = []
            for clause_a in left:
                for clause_b in right:
                    merged.append(_merge_clause(clause_a, clause_b))
            return merged
        raise ValueError(f"unsupported node in CNF conversion: {node_type}")

    return to_cnf(nnf)


def _merge_clause(a: list[tuple[str, bool]], b: list[tuple[str, bool]]):
    seen = set()
    merged = []
    for literal in a + b:
        if literal in seen:
            continue
        opposite = (literal[0], not literal[1])
        if opposite in seen:
            return None  # tautological clause, can be dropped
        seen.add(literal)
        merged.append(literal)
    return merged


def _clause_string(clause: list[tuple[str, bool]]) -> str:
    if not clause:
        return "[] (empty clause)"
    return " | ".join(atom if positive else "~" + atom for atom, positive in clause)


def _resolve_clauses(a: list[tuple[str, bool]], b: list[tuple[str, bool]]):
    for literal in a:
        opposite = (literal[0], not literal[1])
        if opposite in b:
            merged = [item for item in a if item != literal] + [item for item in b if item != opposite]
            seen = []
            for item in merged:
                if item not in seen:
                    seen.append(item)
            if any((atom, not positive) in seen for atom, positive in seen):
                return None  # tautology
            return seen
    return None


def _op_resolve(args: dict) -> dict:
    premises_raw = args.get("premises") or []
    goal_raw = args.get("goal")
    if not isinstance(premises_raw, list) or goal_raw is None:
        raise bad_request("logic.resolve needs 'premises' (array) and 'goal' (string)")
    premises = [parse_formula_string(premise, "prop") for premise in premises_raw]
    goal = parse_formula_string(goal_raw, "prop")
    _validate_prop_formula(goal, "'goal'")
    for premise in premises:
        _validate_prop_formula(premise, "premises")
    clauses: list[list[tuple[str, bool]]] = []
    for premise in premises:
        clauses.extend(_cnf_clauses(premise))
    negated_goal = _nnf(goal, True)
    clauses.extend(_cnf_clauses({"type": "and", "left": negated_goal, "right": {"type": "true"}}))
    normalized = []
    for clause in clauses:
        if clause is None:
            continue
        clause = sorted(clause, key=lambda item: (item[0], item[1]))
        if clause and clause not in normalized:
            normalized.append(clause)
    clauses = normalized
    clause_strings = [_clause_string(clause) for clause in clauses]
    steps = []
    refutable = any(len(clause) == 0 for clause in clauses)
    if not refutable:
        frontier = list(clauses)
        seen = {frozenset(clause) for clause in clauses}
        iterations = 0
        while iterations < MAX_RESOLUTION_STEPS and not refutable:
            iterations += 1
            new_clauses = []
            for i in range(len(frontier)):
                for j in range(i + 1, len(frontier)):
                    resolvent = _resolve_clauses(frontier[i], frontier[j])
                    if resolvent is None:
                        continue
                    key = frozenset(resolvent)
                    if key in seen:
                        continue
                    seen.add(key)
                    new_clauses.append(resolvent)
                    steps.append(
                        [
                            i,
                            j,
                            _clause_string(resolvent),
                        ]
                    )
                    if not resolvent:
                        refutable = True
                        break
                    if len(seen) > MAX_RESOLUTION_CLAUSES:
                        raise limit_error("resolution search exceeded its clause budget")
                if refutable or len(seen) > MAX_RESOLUTION_CLAUSES:
                    break
            if not new_clauses:
                break
            frontier = frontier + new_clauses
    return {
        "refutable": refutable,
        "valid": refutable,
        "clauses": clause_strings,
        "steps": steps,
        "note": (
            "resolution refutation found for premises + ~goal"
            if refutable
            else "no refutation found; the clause set is saturated (or the budget was reached)"
        ),
    }


# ---------------------------------------------------------------------------
# First-order bounded model search
# ---------------------------------------------------------------------------

_STRUCTURE_LIMIT = MAX_FOL_STRUCTURES


def _eval_term(term: dict, env: dict[str, int], structure: dict):
    term_type = term["type"]
    if term_type == "var":
        return env[term["name"]]
    if term_type == "const":
        return structure["constants"][term["name"]]
    if term_type == "func":
        key = tuple(_eval_term(argument, env, structure) for argument in term["args"])
        table = structure["functions"][term["name"]]
        index = 0
        for value in key:
            index = index * structure["domainSize"] + value
        return table[index]
    raise ValueError(f"bad term {term_type}")


def _eval_fol(ast: dict, env: dict[str, int], structure: dict) -> bool:
    node_type = ast["type"]
    if node_type == "true":
        return True
    if node_type == "false":
        return False
    if node_type == "not":
        return not _eval_fol(ast["arg"], env, structure)
    if node_type == "and":
        return _eval_fol(ast["left"], env, structure) and _eval_fol(ast["right"], env, structure)
    if node_type == "or":
        return _eval_fol(ast["left"], env, structure) or _eval_fol(ast["right"], env, structure)
    if node_type == "imp":
        return (not _eval_fol(ast["left"], env, structure)) or _eval_fol(ast["right"], env, structure)
    if node_type == "iff":
        return _eval_fol(ast["left"], env, structure) == _eval_fol(ast["right"], env, structure)
    if node_type == "pred":
        values = tuple(_eval_term(argument, env, structure) for argument in ast["args"])
        return values in structure["predicates"][ast["name"]]
    if node_type == "eq":
        return _eval_term(ast["left"], env, structure) == _eval_term(ast["right"], env, structure)
    if node_type == "forall":
        for element in range(structure["domainSize"]):
            env[ast["var"]] = element
            if not _eval_fol(ast["body"], env, structure):
                env.pop(ast["var"], None)
                return False
        env.pop(ast["var"], None)
        return True
    if node_type == "exists":
        for element in range(structure["domainSize"]):
            env[ast["var"]] = element
            if _eval_fol(ast["body"], env, structure):
                env.pop(ast["var"], None)
                return True
        env.pop(ast["var"], None)
        return False
    raise ValueError(f"not a first-order formula node: {node_type}")


def _structure_count(domain_size: int, predicates: dict[str, int], functions: dict[str, int], constants: list[str]) -> int:
    total = 1
    for arity in predicates.values():
        total *= 2 ** (domain_size ** arity)
    for arity in functions.values():
        total *= domain_size ** (domain_size ** arity)
    total *= domain_size ** len(constants)
    return total


def _iter_structures(domain_size: int, predicates: dict[str, int], functions: dict[str, int], constants: list[str]):
    """Yield every finite structure for the given signature."""
    predicate_names = list(predicates)
    function_names = list(functions)
    total = _structure_count(domain_size, predicates, functions, constants)
    if total > _STRUCTURE_LIMIT:
        raise limit_error(
            f"bounded model search would examine {total} structures (>{_STRUCTURE_LIMIT}); "
            "reduce domainSize or the signature"
        )
    tuples_by_arity = {
        arity: list(itertools.product(range(domain_size), repeat=arity)) for arity in set(predicates.values())
    }

    def predicate_choices(name: str):
        arity = predicates[name]
        combos = tuples_by_arity[arity]
        for mask in range(2 ** len(combos)):
            yield name, frozenset(combos[index] for index in range(len(combos)) if mask >> index & 1)

    def function_choices(name: str):
        arity = functions[name]
        combos = list(itertools.product(range(domain_size), repeat=arity))
        for table in itertools.product(range(domain_size), repeat=len(combos)):
            yield name, list(table)

    def walk_predicate(index: int, predicates_value: dict, functions_value: dict, constants_value: dict):
        if index == len(predicate_names):
            yield from walk_function(0, predicates_value, functions_value, constants_value)
            return
        name = predicate_names[index]
        for key, value in predicate_choices(name):
            new_predicates = dict(predicates_value)
            new_predicates[key] = value
            yield from walk_predicate(index + 1, new_predicates, functions_value, constants_value)

    def walk_function(index: int, predicates_value: dict, functions_value: dict, constants_value: dict):
        if index == len(function_names):
            yield from walk_constant(0, predicates_value, functions_value, constants_value)
            return
        name = function_names[index]
        for key, value in function_choices(name):
            new_functions = dict(functions_value)
            new_functions[key] = value
            yield from walk_function(index + 1, predicates_value, new_functions, constants_value)

    def walk_constant(index: int, predicates_value: dict, functions_value: dict, constants_value: dict):
        if index == len(constants):
            yield {
                "domainSize": domain_size,
                "predicates": predicates_value,
                "functions": functions_value,
                "constants": constants_value,
            }
            return
        name = constants[index]
        for element in range(domain_size):
            new_constants = dict(constants_value)
            new_constants[name] = element
            yield from walk_constant(index + 1, predicates_value, functions_value, new_constants)

    yield from walk_predicate(0, {}, {}, {})


def _structure_json(structure: dict) -> dict:
    domain_size = structure["domainSize"]
    return {
        "domain": list(range(domain_size)),
        "predicates": {
            name: [list(item) for item in sorted(value)] for name, value in structure["predicates"].items()
        },
        "functions": {name: list(value) for name, value in structure["functions"].items()},
        "constants": dict(structure["constants"]),
        "convention": (
            "predicates are sets of tuples over domain elements 0..n-1; function tables are "
            "lists in lexicographic argument order over the same domain"
        ),
    }


def _op_prove_fol(args: dict) -> dict:
    premises_raw = args.get("premises") or []
    goal_raw = args.get("goal")
    if not isinstance(premises_raw, list) or goal_raw is None:
        raise bad_request("logic.prove_fol needs 'premises' (array) and 'goal' (string)")
    domain_size = args.get("domainSize", 4)
    if isinstance(domain_size, bool) or not isinstance(domain_size, int):
        raise bad_request("domainSize must be an integer")
    if not 1 <= domain_size <= 4:
        raise limit_error("domainSize must be between 1 and 4")
    max_solutions = args.get("maxSolutions", 1)
    if isinstance(max_solutions, bool) or not isinstance(max_solutions, int) or max_solutions < 0:
        raise bad_request("maxSolutions must be a non-negative integer")
    premises = [parse_formula_string(premise, "fol") for premise in premises_raw]
    goal = parse_formula_string(goal_raw, "fol")
    predicates: dict[str, int] = {}
    functions: dict[str, int] = {}
    for formula in premises + [goal]:
        for name, arity in predicates_of(formula).items():
            if predicates.get(name, arity) != arity:
                raise bad_request(f"predicate {name!r} used with different arities")
            predicates[name] = arity
        for name, arity in functions_of(formula).items():
            if functions.get(name, arity) != arity:
                raise bad_request(f"function {name!r} used with different arities")
            functions[name] = arity
    constants = sorted({constant for formula in premises + [goal] for constant in constants_of(formula)})
    searched = 0
    checked_domains = []
    for size in range(1, domain_size + 1):
        checked_domains.append(size)
        try:
            structures = _iter_structures(size, predicates, functions, constants)
        except EngineError:
            raise
        for structure in structures:
            searched += 1
            if searched > MAX_FOL_STRUCTURES:
                raise limit_error("bounded model search exceeded its structure budget")
            try:
                premises_true = all(_eval_fol(premise, {}, structure) for premise in premises)
            except (KeyError, IndexError, TypeError):  # pragma: no cover - defensive
                raise domain("could not evaluate the formula under the enumerated structure")
            if not premises_true:
                continue
            if not _eval_fol(goal, {}, structure):
                return {
                    "valid": False,
                    "countermodel": {
                        "domainSize": size,
                        **_structure_json(structure),
                        "falsifiesGoal": True,
                    },
                    "searched": searched,
                    "note": (
                        f"countermodel found on a domain of size {size}; this disproves validity"
                    ),
                }
    return {
        "valid": True,
        "countermodel": None,
        "searched": searched,
        "checkedDomains": checked_domains,
        "note": (
            "bounded check: no countermodel exists on domains of size "
            f"1..{domain_size}. Validity on larger domains is not established by this run."
        ),
    }


# ---------------------------------------------------------------------------
# Modal bounded Kripke semantics
# ---------------------------------------------------------------------------

_MODAL_FRAMES = ("K", "T", "S4", "S5")


def _eval_modal(ast: dict, world: int, relation: list[set[int]], valuation: dict[str, set[int]]) -> bool:
    node_type = ast["type"]
    if node_type == "atom":
        return world in valuation.get(ast["name"], set())
    if node_type == "true":
        return True
    if node_type == "false":
        return False
    if node_type == "not":
        return not _eval_modal(ast["arg"], world, relation, valuation)
    if node_type == "and":
        return _eval_modal(ast["left"], world, relation, valuation) and _eval_modal(
            ast["right"], world, relation, valuation
        )
    if node_type == "or":
        return _eval_modal(ast["left"], world, relation, valuation) or _eval_modal(
            ast["right"], world, relation, valuation
        )
    if node_type == "imp":
        return (not _eval_modal(ast["left"], world, relation, valuation)) or _eval_modal(
            ast["right"], world, relation, valuation
        )
    if node_type == "iff":
        return _eval_modal(ast["left"], world, relation, valuation) == _eval_modal(
            ast["right"], world, relation, valuation
        )
    if node_type == "box":
        return all(_eval_modal(ast["arg"], successor, relation, valuation) for successor in relation[world])
    if node_type == "diamond":
        return any(_eval_modal(ast["arg"], successor, relation, valuation) for successor in relation[world])
    raise ValueError(f"not a modal formula node: {node_type}")


def _relations_for_frame(frame: str, worlds: int):
    pairs = [(i, j) for i in range(worlds) for j in range(worlds)]
    if frame == "K":
        for mask in range(2 ** len(pairs)):
            relation = [set() for _ in range(worlds)]
            for index, (source, target) in enumerate(pairs):
                if mask >> index & 1:
                    relation[source].add(target)
            yield relation
    elif frame == "T":
        for mask in range(2 ** (len(pairs) - worlds)):
            relation = [set() for _ in range(worlds)]
            for index in range(worlds):
                relation[index].add(index)
            free = [(i, j) for i, j in pairs if i != j]
            for index, (source, target) in enumerate(free):
                if mask >> index & 1:
                    relation[source].add(target)
            yield relation
    elif frame in ("S4", "S5"):
        # enumerate all relations and filter to the frame axioms
        for mask in range(2 ** len(pairs)):
            relation = [set() for _ in range(worlds)]
            for index, (source, target) in enumerate(pairs):
                if mask >> index & 1:
                    relation[source].add(target)
            if not all(index in relation[index] for index in range(worlds)):
                continue
            transitive = True
            for source in range(worlds):
                for middle in relation[source]:
                    for target in relation[middle]:
                        if target not in relation[source]:
                            transitive = False
                            break
                    if not transitive:
                        break
                if not transitive:
                    break
            if not transitive:
                continue
            if frame == "S5":
                symmetric = True
                for source in range(worlds):
                    for target in relation[source]:
                        if source not in relation[target]:
                            symmetric = False
                            break
                    if not symmetric:
                        break
                if not symmetric:
                    continue
            yield relation
    else:  # pragma: no cover - validated earlier
        raise bad_request(f"unknown frame {frame!r}")


def _op_modal(args: dict) -> dict:
    frame = str(args.get("frame", "K")).strip().upper()
    if frame not in _MODAL_FRAMES:
        raise bad_request("frame must be one of K, T, S4, S5")
    formula_text = args.get("formula")
    formula = parse_formula_string(formula_text, "modal")
    worlds = args.get("worlds", 3)
    if isinstance(worlds, bool) or not isinstance(worlds, int):
        raise bad_request("worlds must be an integer")
    if not 1 <= worlds <= MAX_DIAGRAM_WORLDS:
        raise limit_error(f"worlds must be between 1 and {MAX_DIAGRAM_WORLDS}")
    atoms = atoms_of(formula)
    # exact counts of frames in each class (preorders and equivalence relations
    # are enumerated by filtering, but their population counts are known)
    preorder_counts = {1: 1, 2: 4, 3: 29, 4: 355}
    equivalence_counts = {1: 1, 2: 2, 3: 5, 4: 15}
    if frame == "K":
        relation_count = 2 ** (worlds * worlds)
    elif frame == "T":
        relation_count = 2 ** (worlds * worlds - worlds)
    elif frame == "S4":
        relation_count = preorder_counts.get(worlds, 2 ** (worlds * worlds))
    else:
        relation_count = equivalence_counts.get(worlds, 2 ** (worlds * worlds))
    valuation_count = 2 ** (worlds * len(atoms))
    estimate = relation_count * valuation_count
    if estimate > MAX_MODAL_MODELS:
        raise limit_error(
            f"bounded modal check would examine about {estimate} models "
            f"(> {MAX_MODAL_MODELS}); reduce 'worlds' or simplify the formula"
        )
    models_checked = 0
    for relation in _relations_for_frame(frame, worlds):
        for mask in range(valuation_count):
            valuation = {atom: set() for atom in atoms}
            for index, atom in enumerate(atoms):
                for world in range(worlds):
                    bit = index * worlds + world
                    if mask >> bit & 1:
                        valuation[atom].add(world)
            models_checked += 1
            for world in range(worlds):
                if not _eval_modal(formula, world, relation, valuation):
                    return {
                        "valid": False,
                        "frame": frame,
                        "worlds": worlds,
                        "modelsChecked": models_checked,
                        "countermodel": {
                            "worlds": list(range(worlds)),
                            "relations": [[source, target] for source in range(worlds) for target in sorted(relation[source])],
                            "valuation": {atom: sorted(value) for atom, value in valuation.items()},
                            "falsifyingWorld": world,
                        },
                        "note": (
                            f"countermodel found on the {frame} frame with {worlds} world(s); "
                            "the formula is not valid on this frame class"
                        ),
                    }
    return {
        "valid": True,
        "frame": frame,
        "worlds": worlds,
        "modelsChecked": models_checked,
        "note": (
            f"bounded check: formula holds in every model on {frame} frames with at most "
            f"{worlds} worlds; larger frames are not covered by this run"
        ),
    }


# ---------------------------------------------------------------------------
# Public handlers
# ---------------------------------------------------------------------------


def parse_formula_string(source, logic: str = "prop") -> dict:
    if not isinstance(source, str):
        raise parse_error("formula must be a string")
    normalized = LOGIC_ALIASES.get(str(logic).strip().lower())
    if normalized is None:
        raise bad_request(f"unknown logic {logic!r}; use prop, fol or modal")
    try:
        return _parse_formula(source, normalized)
    except FormulaError as exc:
        raise parse_error(str(exc)) from exc


def _normalized_logic(value) -> str:
    normalized = LOGIC_ALIASES.get(str(value or "prop").strip().lower())
    if normalized is None:
        raise bad_request("logic must be one of prop, fol, modal")
    return normalized


def op_parse(args: dict) -> dict:
    logic = _normalized_logic(args.get("logic", "prop"))
    source = args.get("formula")
    if not isinstance(source, str):
        raise bad_request("'formula' must be a string")
    try:
        ast = _parse_formula(source, logic)
    except FormulaError as exc:
        return {
            "ast": None,
            "pretty": "",
            "latex": "",
            "atoms": [],
            "freeVars": [],
            "wellFormed": False,
            "logic": logic,
            "error": str(exc),
        }
    return {
        "ast": ast,
        "pretty": to_pretty(ast),
        "latex": to_latex(ast),
        "atoms": atoms_of(ast),
        "predicates": predicates_of(ast),
        "functions": functions_of(ast),
        "constants": constants_of(ast),
        "freeVars": free_vars_of(ast),
        "wellFormed": True,
        "logic": logic,
    }


def op_truthtable(args: dict) -> dict:
    formula = parse_formula_string(args.get("formula"), "prop")
    _validate_prop_formula(formula, "'formula'")
    atoms = atoms_of(formula)
    if len(atoms) > MAX_TRUTH_ATOMS:
        raise limit_error(f"too many atoms ({len(atoms)} > {MAX_TRUTH_ATOMS})")
    rows = truth_rows(formula, atoms)
    tautology = all(row["result"] for row in rows)
    contradiction = not any(row["result"] for row in rows)
    satisfiable = any(row["result"] for row in rows)
    return {
        "atoms": atoms,
        "rows": rows,
        "tautology": tautology,
        "contradiction": contradiction,
        "satisfiable": satisfiable,
        "cnf": cnf_string(atoms, rows),
        "dnf": dnf_string(atoms, rows),
        "pretty": to_pretty(formula),
        "latex": to_latex(formula),
        "rowCount": len(rows),
    }


def op_prove(args: dict) -> dict:
    system = str(args.get("system", "nd")).strip().lower()
    if system not in ("nd", "natural-deduction", "classical"):
        raise EngineError(
            "unsupported",
            "only classical natural deduction is implemented (system='nd'); "
            f"system {system!r} is not supported",
        )
    premises_raw = args.get("premises") or []
    if not isinstance(premises_raw, list):
        raise bad_request("'premises' must be an array of formula strings")
    goal_raw = args.get("goal")
    if goal_raw is None:
        raise bad_request("'goal' is required")
    premises = [parse_formula_string(premise, "prop") for premise in premises_raw]
    goal = parse_formula_string(goal_raw, "prop")
    for premise in premises:
        _validate_prop_formula(premise, "premises")
    _validate_prop_formula(goal, "'goal'")
    atoms, rows, valid, countermodel = _prop_semantics(premises, goal)
    if not valid:
        return {
            "valid": False,
            "proof": None,
            "nodes": [],
            "fitch": [],
            "countermodel": countermodel,
            "system": "classical-nd",
            "atoms": atoms,
        }
    root, nodes, fitch, note = _build_proof(premises, goal)
    result = {
        "valid": True,
        "proof": root,
        "nodes": nodes or [],
        "fitch": fitch or [],
        "system": "classical-nd",
        "atoms": atoms,
        "rules": _RULE_NAMES,
    }
    if note:
        result["note"] = note
    return result


def op_prove_fol(args: dict) -> dict:
    return _op_prove_fol(args)


def op_resolve(args: dict) -> dict:
    return _op_resolve(args)


def op_modal(args: dict) -> dict:
    return _op_modal(args)


def op_equivalent(args: dict) -> dict:
    left = parse_formula_string(args.get("a"), "prop")
    right = parse_formula_string(args.get("b"), "prop")
    _validate_prop_formula(left, "'a'")
    _validate_prop_formula(right, "'b'")
    atoms = sorted(set(atoms_of(left)) | set(atoms_of(right)))
    if len(atoms) > MAX_TRUTH_ATOMS:
        raise limit_error(f"too many atoms ({len(atoms)} > {MAX_TRUTH_ATOMS})")
    rows = truth_rows(left, atoms)
    countermodel = None
    equivalent = True
    for row in rows:
        if eval_prop(left, row["assignment"]) != eval_prop(right, row["assignment"]):
            equivalent = False
            if countermodel is None:
                countermodel = {
                    "assignment": dict(row["assignment"]),
                    "left": eval_prop(left, row["assignment"]),
                    "right": eval_prop(right, row["assignment"]),
                }
    return {
        "equivalent": equivalent,
        "countermodel": countermodel,
        "atoms": atoms,
        "pretty": f"{to_pretty(left)}  <->  {to_pretty(right)}",
        "latex": to_latex({"type": "iff", "left": left, "right": right}),
    }


HANDLERS = {
    "logic.parse": op_parse,
    "logic.truthtable": op_truthtable,
    "logic.prove": op_prove,
    "logic.prove_fol": op_prove_fol,
    "logic.resolve": op_resolve,
    "logic.modal": op_modal,
    "logic.equivalent": op_equivalent,
}
