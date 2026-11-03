"""Abstract algebra ops: ``algebra.perm``, ``algebra.group``, finite fields,
polynomials and ``Z/nZ`` arithmetic.

Permutation encoding is 1-based cycle notation on the wire (docs/API.md)::

    [[1, 2, 3], [4, 5]]   ->  1->2->3->1, 4->5->4, fixed points omitted

Mappings are the 1-based image list: ``mapping[i]`` is the image of ``i+1``.
"""

from __future__ import annotations

import math

import sympy
from sympy.combinatorics import Permutation, PermutationGroup

from mlcore import (
    EngineError,
    bad_request,
    domain,
    expr_result,
    limit_error,
    parse_expression,
    parse_int_arg,
    parse_number,
    text,
    truncate,
    unsupported,
)

MAX_GROUP_DEGREE = 10000
MAX_SUBGROUP_ORDER = 2000
MAX_SUBGROUPS = 400

# ---------------------------------------------------------------------------
# Permutations
# ---------------------------------------------------------------------------


def _validate_cycle_list(raw, name: str = "cycles") -> list[list[int]]:
    if raw is None:
        return []
    if not isinstance(raw, (list, tuple)):
        raise bad_request(f"{name} must be an array of cycles")
    if len(raw) > 200:
        raise limit_error(f"{name}: too many cycles (max 200)")
    seen_points: set[int] = set()
    cleaned: list[list[int]] = []
    for cycle in raw:
        if not isinstance(cycle, (list, tuple)):
            raise bad_request(f"{name} must contain arrays of integers")
        values: list[int] = []
        for point in cycle:
            if isinstance(point, bool) or not isinstance(point, int):
                raise bad_request(f"{name} points must be 1-based integers")
            if point < 1:
                raise bad_request(f"{name} points are 1-based (got {point})")
            if point > MAX_GROUP_DEGREE:
                raise limit_error(f"{name} point {point} exceeds degree limit {MAX_GROUP_DEGREE}")
            if point in seen_points:
                raise bad_request(f"{name}: point {point} occurs in more than one cycle")
            seen_points.add(point)
            values.append(point)
        if len(values) > 1:
            cleaned.append(values)
        elif len(values) == 1:
            # a 1-cycle is a fixed point; keep it out of the permutation data
            seen_points.discard(values[0])
    return cleaned


def parse_cycles(raw, n: int | None = None, name: str = "cycles") -> Permutation:
    """Build a SymPy permutation from 1-based cycles."""
    cleaned = _validate_cycle_list(raw, name)
    needed = max((max(c) for c in cleaned), default=0)
    size = n if n is not None else max(needed, 1)
    if needed > size:
        raise bad_request(f"{name}: uses point {needed} beyond n={size}")
    mapping = list(range(size))
    for cycle in cleaned:
        for index, point in enumerate(cycle):
            src = point - 1
            dst = cycle[(index + 1) % len(cycle)] - 1
            mapping[src] = dst
    return Permutation(mapping)


def resize_perm(perm: Permutation, size: int) -> Permutation:
    if perm.size == size:
        return perm
    if perm.size > size:
        raise bad_request(f"permutation degree {perm.size} exceeds n={size}")
    mapping = list(perm.array_form) + list(range(perm.size, size))
    return Permutation(mapping)


def perm_cycles(perm: Permutation) -> list[list[int]]:
    return [[point + 1 for point in cycle] for cycle in perm.cyclic_form]


def perm_mapping(perm: Permutation) -> list[int]:
    return [image + 1 for image in perm.array_form]


def perm_label(perm: Permutation) -> str:
    cycles = perm.cyclic_form
    if not cycles:
        return "()"
    return "".join("(" + " ".join(str(p + 1) for p in cycle) + ")" for cycle in cycles)


def _cycle_type(perm: Permutation) -> str:
    lengths = [len(cycle) for cycle in perm.cyclic_form]
    lengths.extend([1] * (perm.size - sum(lengths)))
    lengths = [length for length in lengths if length > 0]
    lengths.sort(reverse=True)
    return "+".join(str(length) for length in lengths) if lengths else "1"


def perm_result(perm: Permutation) -> dict:
    return {
        "cycles": perm_cycles(perm),
        "mapping": perm_mapping(perm),
        "order": int(perm.order()),
        "parity": "even" if perm.signature() == 1 else "odd",
        "cycle_type": _cycle_type(perm),
        "cycle_lengths": sorted(
            [len(cycle) for cycle in perm.cyclic_form]
            + [1] * (perm.size - sum(len(c) for c in perm.cyclic_form)),
            reverse=True,
        ),
        "size": int(perm.size),
        "pretty": perm_label(perm),
    }


def _perm_from_mapping(mapping) -> Permutation:
    if not isinstance(mapping, (list, tuple)) or not mapping:
        raise bad_request("'mapping' must be a non-empty array of 1-based images")
    if len(mapping) > MAX_GROUP_DEGREE:
        raise limit_error("mapping too long")
    values = []
    for point in mapping:
        if isinstance(point, bool) or not isinstance(point, int):
            raise bad_request("mapping entries must be 1-based integers")
        if point < 1:
            raise bad_request("mapping entries are 1-based")
        values.append(point)
    n = len(values)
    if sorted(values) != list(range(1, n + 1)):
        raise domain("mapping must be a permutation of 1..n")
    return Permutation([point - 1 for point in values])


def _op_perm(args):
    op = str(args.get("op", "")).strip().lower()
    if not op:
        raise bad_request("missing required argument: op")
    n_arg = args.get("n")
    n = parse_int_arg(n_arg, "n", None, minimum=1, maximum=MAX_GROUP_DEGREE) if n_arg is not None else None
    if op == "from_mapping":
        perm = _perm_from_mapping(args.get("mapping"))
        if n is not None:
            perm = resize_perm(perm, n)
        out = perm_result(perm)
        out["op"] = op
        return out
    perm = parse_cycles(args.get("cycles"), n)
    if op == "multiply":
        other = parse_cycles(args.get("other"), max(n or 0, perm.size) or None, "other")
        if n is not None:
            other = resize_perm(other, n)
        size = max(perm.size, other.size)
        result = resize_perm(perm, size) * resize_perm(other, size)
        out = perm_result(result)
        out["op"] = op
        out["note"] = "composition applies 'other' first, then 'cycles'"
        return out
    if op == "inverse":
        result = perm ** -1
    elif op == "order":
        result = perm
    elif op == "cycle_type":
        result = perm
    elif op == "sign":
        result = perm
    elif op == "conjugate":
        if args.get("other") is not None:
            other = parse_cycles(args.get("other"), max(n or 0, perm.size) or None, "other")
            if n is not None:
                other = resize_perm(other, n)
            size = max(perm.size, other.size)
            p = resize_perm(perm, size)
            q = resize_perm(other, size)
            result = q * p * q ** -1
        else:
            result = perm
    elif op == "to_mapping":
        result = perm
    else:
        raise unsupported(f"unsupported permutation op: {op}")
    out = perm_result(result)
    out["op"] = op
    return out


# ---------------------------------------------------------------------------
# Permutation groups
# ---------------------------------------------------------------------------


def _build_group(args: dict) -> tuple[PermutationGroup, int]:
    raw = args.get("generators")
    if not isinstance(raw, (list, tuple)) or len(raw) == 0:
        raise bad_request("'generators' must be a non-empty array of permutation cycles")
    if len(raw) > 12:
        raise limit_error("at most 12 generators are supported")
    n_arg = args.get("n")
    n = parse_int_arg(n_arg, "n", None, minimum=1, maximum=MAX_GROUP_DEGREE) if n_arg is not None else None
    perms = [parse_cycles(item, None, "generator") for item in raw]
    if n is None:
        n = max((perm.size for perm in perms), default=1)
    if any(perm.size > n for perm in perms):
        raise bad_request(f"a generator uses points beyond n={n}")
    perms = [resize_perm(perm, n) for perm in perms]
    try:
        group = PermutationGroup(perms)
    except Exception as exc:
        raise domain(f"could not build permutation group: {exc}") from exc
    order = int(group.order())
    if order > 10000:
        raise limit_error(f"group order {order} exceeds limit 10000")
    return group, n


def _sorted_elements(group: PermutationGroup) -> list[Permutation]:
    return sorted(group.elements, key=lambda perm: tuple(perm.array_form))


def _element_entries(group: PermutationGroup) -> list[dict]:
    entries = []
    for index, perm in enumerate(_sorted_elements(group)):
        item = perm_result(perm)
        item["id"] = f"g{index}"
        item["label"] = item["pretty"]
        entries.append(item)
    return entries


def _enumerate_subgroups(group: PermutationGroup) -> list[PermutationGroup]:
    order = int(group.order())
    if order > MAX_SUBGROUP_ORDER:
        raise limit_error(
            f"subgroup enumeration is limited to groups of order <= {MAX_SUBGROUP_ORDER} "
            f"(this group has order {order})"
        )
    degree = group.degree
    identity = Permutation(list(range(degree))) if degree else Permutation(1)
    root = PermutationGroup([identity])
    seen = {frozenset(root.elements)}
    subgroups = [root]
    queue = [root]
    all_elements = list(group.elements)
    while queue:
        subgroup = queue.pop()
        current = set(subgroup.elements)
        for element in all_elements:
            if element in current:
                continue
            try:
                candidate = PermutationGroup(list(subgroup.generators) + [element])
            except Exception:  # pragma: no cover - defensive
                continue
            key = frozenset(candidate.elements)
            if key in seen:
                continue
            seen.add(key)
            subgroups.append(candidate)
            queue.append(candidate)
            if len(subgroups) > MAX_SUBGROUPS:
                raise limit_error(f"subgroup enumeration exceeds {MAX_SUBGROUPS} subgroups")
    subgroups.sort(key=lambda sub: (sub.order(), tuple(sorted(tuple(p.array_form) for p in sub.elements))))
    return subgroups


def _is_normal_subgroup(sub: PermutationGroup, group: PermutationGroup) -> bool:
    """Exact normality test by conjugation closure.

    SymPy's ``PermutationGroup.is_normal`` short-circuits on ``_is_abelian`` and
    therefore reports every abelian subgroup as normal; that is wrong for a
    non-abelian ambient group (the three C2 subgroups of S3 are the standard
    counterexample). Check "g H g^-1 <= H" using generators only, which is
    sufficient because the conjugates of H's generators generate gHg^-1 and G is
    generated by its own generators.
    """
    try:
        if sub.is_trivial:
            return True
        if group.is_abelian:
            return True
    except Exception:  # pragma: no cover - defensive
        pass
    try:
        for g in group.generators:
            for h in sub.generators:
                if not sub.contains(g * h * g**-1):
                    return False
        return True
    except Exception:  # pragma: no cover - defensive
        return False


def _group_notation(group: PermutationGroup) -> str:
    order = int(group.order())
    if order == 1:
        return "1"
    try:
        if group.is_cyclic:
            return f"C{order}"
    except Exception:  # pragma: no cover - defensive
        pass
    try:
        abelian = bool(group.is_abelian)
    except Exception:  # pragma: no cover - defensive
        abelian = False
    if abelian:
        factors = sympy.factorint(order)
        # describe elementary abelian and small abelian groups
        if all(exp == 1 for exp in factors.values()):
            return " x ".join(f"C{p}" for p in sorted(factors))
        if order == 4:
            return "C2 x C2"
        if order == 8 and not group.is_cyclic:
            return "C2 x C2 x C2"
        if order == p2_order(order):
            prime = p2_order(order)
            if prime:
                return f"C{prime} x C{prime}"
        return f"order {order} abelian"
    if order == 6:
        return "S3"
    if order == 24:
        return "S4"
    return f"order {order}"


def p2_order(order: int):
    root = int(round(math.isqrt(order)))
    return root if root * root == order else None


def _subgroup_entry(sub: PermutationGroup, index: int) -> dict:
    elements = _sorted_elements(sub)
    return {
        "id": f"H{index}",
        "label": _group_notation(sub),
        "order": int(sub.order()),
        "generators": [perm_cycles(gen) for gen in sub.generators],
        "cycles": [perm_label(element) for element in elements],
        "elements": [perm_label(element) for element in elements],
    }


def _op_group(args):
    op = str(args.get("op", "")).strip().lower()
    if not op:
        raise bad_request("missing required argument: op")
    group, n = _build_group(args)
    order = int(group.order())
    if op == "order":
        return {"op": op, "order": order, "is_abelian": bool(group.is_abelian)}
    if op == "elements":
        entries = _element_entries(group)
        return {"op": op, "order": order, "elements": entries}
    if op == "is_abelian":
        return {"op": op, "value": bool(group.is_abelian), "order": order}
    if op == "element_orders":
        counts: dict[int, int] = {}
        for element in group.elements:
            element_order = int(element.order())
            counts[element_order] = counts.get(element_order, 0) + 1
        return {
            "op": op,
            "order": order,
            "orders": [{"order": k, "count": v} for k, v in sorted(counts.items())],
            "multiplicities": {str(k): v for k, v in sorted(counts.items())},
        }
    if op == "center":
        center = group.center()
        return {
            "op": op,
            "order": int(center.order()),
            "elements": [perm_label(element) for element in _sorted_elements(center)],
            "is_trivial": int(center.order()) == 1,
        }
    if op == "commutator":
        derived = group.derived_subgroup()
        return {
            "op": op,
            "order": int(derived.order()),
            "elements": [perm_label(element) for element in _sorted_elements(derived)],
            "index": order // int(derived.order()),
            "is_perfect": int(derived.order()) == order,
        }
    if op == "conjugacy_classes":
        classes = []
        for index, klass in enumerate(group.conjugacy_classes()):
            members = _sorted_elements(PermutationGroup(list(klass)))
            classes.append(
                {
                    "id": f"K{index}",
                    "size": len(klass),
                    "elements": [perm_label(element) for element in members],
                    "cycle_type": _cycle_type(members[0]) if members else "1",
                }
            )
        classes.sort(key=lambda item: (-item["size"], item["cycle_type"]))
        return {"op": op, "classes": classes, "count": len(classes)}
    if op == "subgroups":
        subgroups = _enumerate_subgroups(group)
        return {
            "op": op,
            "order": order,
            "subgroups": [_subgroup_entry(sub, index) for index, sub in enumerate(subgroups)],
        }
    if op == "subgroup_lattice":
        subgroups = _enumerate_subgroups(group)
        entries = [_subgroup_entry(sub, index) for index, sub in enumerate(subgroups)]
        element_sets = [frozenset(sub.elements) for sub in subgroups]
        total = len(subgroups)
        covering: list[tuple[int, int]] = []
        for i in range(total):
            for j in range(total):
                if i == j or element_sets[i] >= element_sets[j]:
                    continue
                if len(element_sets[i]) >= len(element_sets[j]):
                    continue
                if not element_sets[i] < element_sets[j]:
                    continue
                intermediate = any(
                    element_sets[i] < element_sets[k] < element_sets[j]
                    for k in range(total)
                    if k not in (i, j)
                )
                if not intermediate:
                    covering.append((i, j))
        for index, entry in enumerate(entries):
            sub = subgroups[index]
            entry["isNormal"] = _is_normal_subgroup(sub, group)
            entry["isMaximal"] = group.order() > sub.order() and not any(
                element_sets[index] < element_sets[k] and k != index
                for k in range(total)
                if element_sets[k] == frozenset(group.elements)
            )
        # maximal proper: no subgroup strictly between it and G
        full_index = next((i for i, s in enumerate(element_sets) if len(s) == order), None)
        for index, entry in enumerate(entries):
            if full_index is None or index == full_index:
                entry["isMaximal"] = False
                continue
            if len(element_sets[index]) == order:
                entry["isMaximal"] = False
                continue
            entry["isMaximal"] = not any(
                element_sets[index] < element_sets[k] and element_sets[k] != frozenset(group.elements)
                for k in range(total)
                if k != index
            )
        edges = []
        normal_edges = []
        for i, j in covering:
            edge = [entries[i]["id"], entries[j]["id"]]
            edges.append(edge)
            try:
                normal = _is_normal_subgroup(subgroups[i], subgroups[j])
            except Exception:  # pragma: no cover - defensive
                normal = False
            if normal:
                normal_edges.append(edge)
        edges.sort()
        normal_edges.sort()
        return {"op": op, "nodes": entries, "edges": edges, "normalEdges": normal_edges}
    if op == "normal_subgroups":
        subgroups = _enumerate_subgroups(group)
        normal = [sub for sub in subgroups if _is_normal_subgroup(sub, group)]
        return {
            "op": op,
            "order": order,
            "subgroups": [_subgroup_entry(sub, index) for index, sub in enumerate(normal)],
            "count": len(normal),
        }
    if op == "quotient":
        return _op_quotient(args, group, n)
    if op == "cayley_table":
        elements = _sorted_elements(group)
        labels = [perm_label(element) for element in elements]
        index = {element: i for i, element in enumerate(elements)}
        table = [[index[elements[i] * elements[j]] for j in range(len(elements))] for i in range(len(elements))]
        return {
            "op": op,
            "order": order,
            "elements": labels,
            "table": table,
            "note": "table[i][j] is the index of elements[i] * elements[j] (left factor first)",
        }
    if op == "is_solvable":
        return {"op": op, "value": bool(group.is_solvable), "order": order}
    if op == "is_nilpotent":
        return {"op": op, "value": bool(group.is_nilpotent), "order": order}
    if op == "is_simple":
        subgroups = _enumerate_subgroups(group)
        nontrivial_normal = [
            sub for sub in subgroups
            if _is_normal_subgroup(sub, group) and 1 < sub.order() < order
        ]
        return {
            "op": op,
            "value": order > 1 and not nontrivial_normal,
            "order": order,
            "normal_subgroup_count": len(nontrivial_normal),
        }
    if op == "sylow":
        return _op_sylow(group)
    if op == "homomorphism":
        return _op_homomorphism(args, group, n)
    raise unsupported(f"unsupported group op: {op}")


def _op_quotient(args, group: PermutationGroup, n: int):
    normal_raw = args.get("normal")
    if normal_raw is None:
        raise bad_request("'normal' subgroup cycles are required for quotient")
    normal_generators = [parse_cycles(item, n, "normal generator") for item in _as_list(normal_raw)]
    normal = PermutationGroup(normal_generators)
    group_elements = set(group.elements)
    if not all(element in group_elements for element in normal.elements):
        raise domain("normal subgroup is not a subgroup of the group")
    if not _is_normal_subgroup(normal, group):
        raise domain("subgroup is not normal; quotient is undefined")
    elements = _sorted_elements(group)
    remaining = set(elements)
    cosets: list[tuple[Permutation, list[Permutation]]] = []
    identity = Permutation(list(range(group.degree))) if group.degree else Permutation(1)
    while remaining:
        representative = identity if identity in remaining else min(
            remaining, key=lambda perm: tuple(perm.array_form)
        )
        members = {representative * element for element in normal.elements}
        members = sorted(members, key=lambda perm: tuple(perm.array_form))
        cosets.append((representative, members))
        remaining -= set(members)
    quotient_order = len(cosets)
    coset_of: dict[Permutation, int] = {}
    for index, (_, members) in enumerate(cosets):
        for element in members:
            coset_of[element] = index
    multiplication = [
        [coset_of[cosets[i][0] * cosets[j][0]] for j in range(quotient_order)]
        for i in range(quotient_order)
    ]
    abelian = all(
        multiplication[i][j] == multiplication[j][i]
        for i in range(quotient_order)
        for j in range(quotient_order)
    )
    identity_coset = coset_of[identity]
    orders = []
    for i in range(quotient_order):
        current = identity_coset
        order_i = 1
        while current != identity_coset or order_i == 1:
            current = multiplication[current][i]
            order_i += 1
            if order_i > quotient_order + 1:
                break
        orders.append(order_i)
    cyclic = quotient_order > 0 and any(o == quotient_order for o in orders)
    entries = []
    for index, (representative, members) in enumerate(cosets):
        entries.append(
            {
                "label": f"q{index}",
                "representative": perm_label(representative),
                "coset": [perm_label(element) for element in members],
                "order": orders[index],
            }
        )
    name = "trivial" if quotient_order == 1 else (f"C{quotient_order}" if cyclic else None)
    out = {
        "op": "quotient",
        "order": quotient_order,
        "elements": entries,
        "abelian": abelian,
        "cyclic": cyclic,
        "is_abelian": abelian,
    }
    if name:
        out["name"] = name
    return out


def _as_list(value):
    if isinstance(value, (list, tuple)):
        return list(value)
    return [value]


def _op_sylow(group: PermutationGroup):
    order = int(group.order())
    factors = sympy.factorint(order)
    group_elements = list(group.elements)
    identity = Permutation(list(range(group.degree))) if group.degree else Permutation(1)
    primes = []
    for prime in sorted(factors):
        subgroup = group.sylow_subgroup(int(prime))
        sub_order = int(subgroup.order())
        sub_elements = set(subgroup.elements)
        generator_elements = list(subgroup.generators)
        normalizer_size = 0
        for element in group_elements:
            conjugate_ok = True
            for generator in generator_elements:
                try:
                    if element * generator * element ** -1 not in sub_elements:
                        conjugate_ok = False
                        break
                except Exception:  # pragma: no cover - defensive
                    conjugate_ok = False
                    break
            if conjugate_ok:
                normalizer_size += 1
        count = order // normalizer_size if normalizer_size else None
        primes.append(
            {
                "p": int(prime),
                "count": count,
                "orders": [sub_order],
                "subgroup_generators": [perm_cycles(gen) for gen in subgroup.generators],
                "is_normal": _is_normal_subgroup(subgroup, group),
                "normalizer_order": normalizer_size,
            }
        )
    return {"op": "sylow", "order": order, "primes": primes}


def _op_homomorphism(args, group: PermutationGroup, n: int):
    target_raw = args.get("target_generators")
    if not isinstance(target_raw, (list, tuple)) or not target_raw:
        raise bad_request("'target_generators' must be a non-empty array of permutation cycles")
    images_raw = args.get("images")
    if not isinstance(images_raw, (list, tuple)) or len(images_raw) != len(args.get("generators")):
        raise bad_request("'images' must provide one permutation per source generator")
    target_n = parse_int_arg(args.get("target_n", args.get("n_target")), "target_n", None, minimum=1, maximum=MAX_GROUP_DEGREE) if args.get("target_n", args.get("n_target")) is not None else None
    # target generators are permutations, optionally on their own degree
    targets = [parse_cycles(item, None, "target generator") for item in target_raw]
    target_size = target_n or max((perm.size for perm in targets), default=1)
    targets = [resize_perm(perm, target_size) for perm in targets]
    try:
        target = PermutationGroup(targets)
    except Exception as exc:
        raise domain(f"could not build target group: {exc}") from exc
    if int(target.order()) > 10000:
        raise limit_error("target group order exceeds limit 10000")
    image_perms = [parse_cycles(item, None, "image") for item in images_raw]
    for perm in image_perms:
        if perm.size > target_size:
            raise bad_request("image permutation degree exceeds target group degree")
    image_perms = [resize_perm(perm, target_size) for perm in image_perms]
    source_generators = list(group.generators)
    if len(source_generators) != len(image_perms):
        raise bad_request("one image is required per group generator")
    identity_source = Permutation(list(range(group.degree))) if group.degree else Permutation(1)
    identity_target = Permutation(list(range(target_size)))
    assignment = {identity_source: identity_target}
    queue = [identity_source]
    reason = None
    while queue:
        element = queue.pop()
        image = assignment[element]
        for gen, gen_image in zip(source_generators, image_perms):
            successor = element * gen
            successor_image = image * gen_image
            if successor in assignment:
                if assignment[successor] != successor_image:
                    reason = (
                        "generator images are not consistent with the group relations "
                        f"(conflict at element {perm_label(successor)})"
                    )
                    queue = []
                    break
            else:
                assignment[successor] = successor_image
                queue.append(successor)
    if reason is None and len(assignment) != int(group.order()):
        reason = "generator images do not define a single-valued map on the whole group"
    if reason:
        return {"op": "homomorphism", "valid": False, "reason": reason, "kernel": [], "image": []}
    kernel = [perm_label(element) for element, image in assignment.items() if image == identity_target]
    image_elements = set(assignment.values())
    image_group = PermutationGroup(list(image_elements)) if image_elements else PermutationGroup([identity_target])
    image_labels = sorted(perm_label(element) for element in image_elements)
    return {
        "op": "homomorphism",
        "valid": True,
        "kernel": sorted(kernel),
        "kernel_order": len(kernel),
        "image": image_labels,
        "image_order": int(image_group.order()),
        "injective": len(kernel) == 1,
        "surjective": int(image_group.order()) == int(target.order()),
    }


# ---------------------------------------------------------------------------
# Finite fields GF(p^n)
# ---------------------------------------------------------------------------

_MAX_FIELD_Q = 4096


def _is_prime(value: int) -> bool:
    return value >= 2 and bool(sympy.isprime(value))


class FiniteField:
    def __init__(self, p: int, n: int = 1, irr=None):
        if not _is_prime(p):
            raise domain(f"p must be prime (got {p})")
        if n < 1:
            raise domain("n must be >= 1")
        q = p ** n
        if q > _MAX_FIELD_Q:
            raise limit_error(f"GF({p}^{n}) has {q} elements; construction is limited to q <= {_MAX_FIELD_Q}")
        self.p = p
        self.n = n
        self.q = q
        if n == 1:
            self.irr_coeffs = [0, 1]
        elif irr is not None:
            coeffs = _coeff_list(irr)
            coeffs = [int(c) % p for c in coeffs]
            while coeffs and coeffs[-1] == 0:
                coeffs.pop()
            if len(coeffs) != n + 1 or coeffs[-1] % p != 1:
                raise domain(f"irreducible polynomial must be monic of degree {n}")
            poly = sympy.Poly(_poly_expr(coeffs), sympy.Symbol("x"), modulus=p)
            if not poly.is_irreducible:
                raise domain("provided polynomial is not irreducible")
            self.irr_coeffs = coeffs
        else:
            self.irr_coeffs = self._find_irreducible()
        self.modulus = None
        if n > 1:
            self.modulus = sympy.Poly(_poly_expr(self.irr_coeffs), sympy.Symbol("x"), modulus=p)

    def _find_irreducible(self):
        p, n = self.p, self.n
        if n == 1:
            return [0, 1]
        # deterministic candidate search (monic, nonzero constant term)
        candidates = []
        for index in range(p ** n):
            digits = []
            rest = index
            for _ in range(n):
                digits.append(rest % p)
                rest //= p
            coeffs = digits + [1]
            if coeffs[0] == 0:
                continue
            candidates.append(coeffs)
        for coeffs in candidates:
            poly = sympy.Poly(_poly_expr(coeffs), sympy.Symbol("x"), modulus=p)
            if poly.is_irreducible:
                return coeffs
        raise domain(f"could not find an irreducible polynomial of degree {n} over GF({p})")

    # -- element codec ------------------------------------------------------
    def digits(self, value: int) -> list[int]:
        if value < 0 or value >= self.q:
            raise domain(f"element integer {value} out of range 0..{self.q - 1}")
        digits = []
        rest = value
        for _ in range(self.n):
            digits.append(rest % self.p)
            rest //= self.p
        return digits

    def encode(self, digits: list[int]) -> int:
        value = 0
        for index, coefficient in enumerate(digits[: self.n]):
            value += (coefficient % self.p) * (self.p ** index)
        return value

    def parse_element(self, raw, name: str = "a") -> int:
        if raw is None:
            raise bad_request(f"missing required argument: {name}")
        if isinstance(raw, bool):
            raise bad_request(f"{name} must be a field element")
        if isinstance(raw, int):
            return raw % self.q if 0 <= raw < self.q else self.encode(self.digits(raw % self.q))
        if isinstance(raw, (list, tuple)):
            digits = [int(c) % self.p for c in raw]
            digits = (digits + [0] * self.n)[: self.n]
            return self.encode(digits)
        if isinstance(raw, dict):
            if "coeffs" in raw:
                return self.parse_element(raw["coeffs"], name)
            if "int" in raw:
                return self.parse_element(raw["int"], name)
            raise bad_request(f"{name}: object needs 'coeffs' or 'int'")
        if isinstance(raw, str):
            expr = parse_expression(raw)
            x = sympy.Symbol("x")
            try:
                poly = sympy.Poly(expr, x, modulus=self.p)
            except Exception as exc:
                raise bad_request(f"{name}: could not interpret as a polynomial: {exc}") from exc
            coeffs = list(reversed(poly.all_coeffs()))
            coeffs = [int(c) % self.p for c in coeffs]
            if self.modulus is not None and len(coeffs) > self.n:
                remainder = sympy.Poly(expr, x, modulus=self.p) % self.modulus
                coeffs = [int(c) % self.p for c in reversed(remainder.all_coeffs())]
            coeffs = (coeffs + [0] * self.n)[: self.n]
            return self.encode(coeffs)
        raise bad_request(f"{name} must be an integer, coefficient array or polynomial string")

    # -- arithmetic ---------------------------------------------------------
    def add(self, a: int, b: int) -> int:
        da, db = self.digits(a), self.digits(b)
        return self.encode([(x + y) % self.p for x, y in zip(da, db)])

    def sub(self, a: int, b: int) -> int:
        da, db = self.digits(a), self.digits(b)
        return self.encode([(x - y) % self.p for x, y in zip(da, db)])

    def mul(self, a: int, b: int) -> int:
        da, db = self.digits(a), self.digits(b)
        product = [0] * (2 * self.n - 1)
        for i, x in enumerate(da):
            if not x:
                continue
            for j, y in enumerate(db):
                product[i + j] = (product[i + j] + x * y) % self.p
        if self.n > 1:
            product = self._reduce(product)
        return self.encode(product[: self.n])

    def _reduce(self, coeffs: list[int]) -> list[int]:
        p = self.p
        irr = [c % p for c in self.irr_coeffs]
        work = list(coeffs) + [0] * (self.n + 1)
        for degree in range(len(work) - 1, self.n - 1, -1):
            coefficient = work[degree] % p
            if not coefficient:
                continue
            shift = degree - self.n
            for index in range(self.n + 1):
                work[shift + index] = (work[shift + index] - coefficient * irr[index]) % p
        return [c % p for c in work[: self.n]]

    def neg(self, a: int) -> int:
        return self.encode([(-c) % self.p for c in self.digits(a)])

    def pow(self, base: int, exponent: int) -> int:
        if exponent < 0:
            base = self.inv(base)
            exponent = -exponent
        result = 1  # multiplicative identity: digits [1,0,...]
        power = base
        while exponent:
            if exponent & 1:
                result = self.mul(result, power)
            power = self.mul(power, power)
            exponent >>= 1
        return result

    def inv(self, a: int) -> int:
        if a % self.q == 0:
            raise domain("division by zero in finite field")
        return self.pow(a, self.q - 2)

    # -- presentation -------------------------------------------------------
    def element_poly(self, a: int) -> str:
        return _poly_str(self.digits(a))

    def element_json(self, a: int) -> dict:
        return {"coeffs": self.digits(a), "poly": self.element_poly(a), "int": int(a)}

    def element_order(self, a: int) -> int:
        if a % self.q == 0:
            raise domain("zero has no multiplicative order")
        order = 1
        current = a
        while current != 1:
            current = self.mul(current, a)
            order += 1
            if order > self.q:
                raise domain("could not determine multiplicative order")
        return order


def _coeff_list(raw) -> list:
    if isinstance(raw, (list, tuple)):
        values = []
        for item in raw:
            if isinstance(item, bool):
                raise bad_request("coefficients must be numbers")
            values.append(int(item))
        return values
    if isinstance(raw, str):
        expr = parse_expression(raw)
        x = sympy.Symbol("x")
        poly = sympy.Poly(expr, x)
        return [int(c) for c in reversed(poly.all_coeffs())]
    raise bad_request("polynomial must be a coefficient array or a polynomial string")


def _poly_expr(coeffs_low_to_high: list) -> sympy.Expr:
    x = sympy.Symbol("x")
    expression = sympy.Integer(0)
    for index, coefficient in enumerate(coeffs_low_to_high):
        coefficient = int(coefficient)
        if coefficient:
            expression += coefficient * x ** index
    return expression


def _poly_str(coeffs_low_to_high: list) -> str:
    x = sympy.Symbol("x")
    expression = _poly_expr(coeffs_low_to_high)
    return truncate(str(expression).replace("**", "^").replace("*", " ").replace("  ", " "))


def _find_irr(p: int, n: int) -> list[int]:
    return FiniteField(p, n).irr_coeffs


def _op_finitefield(args):
    p = parse_int_arg(args.get("p"), "p", minimum=2, maximum=_MAX_FIELD_Q)
    n = parse_int_arg(args.get("n"), "n", 1, minimum=1, maximum=12)
    op = str(args.get("op", "")).strip().lower()
    if not op:
        raise bad_request("missing required argument: op")
    irr = args.get("irreducible")
    field = FiniteField(p, n, irr)
    base = {
        "p": p,
        "n": n,
        "q": field.q,
        "irreducible_poly": field.irr_coeffs if n > 1 else [0, 1],
        "irreducible_poly_str": _poly_str(field.irr_coeffs) if n > 1 else "x",
    }
    if op in ("add", "sub", "mul", "div", "inv", "pow"):
        a_raw = args.get("a")
        b_raw = args.get("b")
        if op == "inv":
            a = field.parse_element(a_raw, "a")
            result = field.inv(a)
        elif op == "pow":
            a = field.parse_element(a_raw if a_raw is not None else 0, "a")
            exponent_raw = b_raw if b_raw is not None else args.get("exponent")
            exponent = parse_int_arg(exponent_raw, "b (exponent)", minimum=-10**9, maximum=10**9)
            result = field.pow(a, exponent)
            base["exponent"] = exponent
        else:
            a = field.parse_element(a_raw, "a")
            b = field.parse_element(b_raw, "b")
            if op == "add":
                result = field.add(a, b)
            elif op == "sub":
                result = field.sub(a, b)
            elif op == "mul":
                result = field.mul(a, b)
            else:
                if b % field.q == 0:
                    raise domain("division by zero in finite field")
                result = field.mul(a, field.inv(b))
            base["a"] = field.element_json(a)
            base["b"] = field.element_json(b)
        base["value"] = field.element_json(result)
        base["op"] = op
        return base
    if op == "table":
        if field.q > 256:
            raise limit_error("Cayley tables are limited to q <= 256")
        size = field.q
        add_table = [[field.add(i, j) for j in range(size)] for i in range(size)]
        mul_table = [[field.mul(i, j) for j in range(size)] for i in range(size)]
        return {
            **base,
            "op": op,
            "elements": [field.element_poly(i) for i in range(size)],
            "add": add_table,
            "mul": mul_table,
            "table": {"add": add_table, "mul": mul_table},
            "note": "tables are indexed by element integer 0..q-1",
        }
    if op == "order":
        if args.get("a") is not None:
            a = field.parse_element(args.get("a"), "a")
            base["a"] = field.element_json(a)
            base["value"] = field.element_order(a)
        else:
            base["value"] = field.q - 1
        base["op"] = op
        return base
    if op == "primitive_element":
        for candidate in range(1, field.q):
            if field.element_order(candidate) == field.q - 1:
                base["op"] = op
                base["value"] = field.element_json(candidate)
                base["order"] = field.q - 1
                return base
        raise domain("no primitive element found")
    if op == "is_irreducible":
        coeffs_raw = args.get("coeffs", args.get("a"))
        if coeffs_raw is None:
            base["op"] = op
            base["value"] = True
            return base
        coeffs = _coeff_list(coeffs_raw)
        coeffs = [int(c) % p for c in coeffs]
        poly = sympy.Poly(_poly_expr(coeffs), sympy.Symbol("x"), modulus=p)
        base["op"] = op
        base["value"] = bool(poly.is_irreducible)
        base["degree"] = int(poly.degree())
        return base
    raise unsupported(f"unsupported finite field op: {op}")


# ---------------------------------------------------------------------------
# Polynomials
# ---------------------------------------------------------------------------


def _parse_poly_args(args):
    coeffs_raw = args.get("coeffs")
    if not isinstance(coeffs_raw, (list, tuple)) or not coeffs_raw:
        raise bad_request("'coeffs' must be a non-empty array (low -> high degree)")
    if len(coeffs_raw) > 64:
        raise limit_error("at most 64 coefficients are supported")
    p = parse_int_arg(args.get("p"), "p", 0, minimum=0, maximum=10**6)
    x = sympy.Symbol("x")
    coefficients = []
    for item in coeffs_raw:
        if isinstance(item, bool):
            raise bad_request("coefficients must be numbers")
        if isinstance(item, int):
            value = item
        else:
            value = sympy.nsimplify(parse_number(item, "coefficient"))
        coefficients.append(value)
    if p:
        if not _is_prime(p):
            raise domain("p must be prime when nonzero")
        expression = _poly_expr([int(c) % p for c in coefficients])
        poly = sympy.Poly(expression, x, modulus=p)
        domain_name = f"GF({p})"
    else:
        expression = _poly_expr([sympy.nsimplify(c) for c in coefficients])
        poly = sympy.Poly(expression, x)
        domain_name = "Q"
    if poly.degree() < 0:
        raise domain("zero polynomial has no degree")
    return poly, p, domain_name


def _op_poly(args):
    op = str(args.get("op", "")).strip().lower()
    if not op:
        raise bad_request("missing required argument: op")
    poly, p, domain_name = _parse_poly_args(args)
    x = sympy.Symbol("x")
    base = {
        "op": op,
        "coeffs": [int(c) % p if p else text(sympy.sstr(c)) for c in reversed(poly.all_coeffs())],
        "degree": int(poly.degree()),
        "domain": domain_name,
    }
    if op == "degree":
        base["value"] = int(poly.degree())
        return base
    if op == "factor":
        try:
            constant, factors = poly.factor_list()
        except Exception as exc:
            raise unsupported(f"factorisation failed over {domain_name}: {exc}") from exc
        factor_entries = []
        for factor, multiplicity in factors:
            factor_entries.append(
                {
                    "poly": truncate(str(factor.as_expr()).replace("**", "^")),
                    "coeffs": [int(c) % p if p else text(sympy.sstr(c)) for c in reversed(factor.all_coeffs())],
                    "degree": int(factor.degree()),
                    "multiplicity": int(multiplicity),
                }
            )
        base["value"] = factor_entries
        base["factors"] = factor_entries
        base["constant"] = int(constant) % p if p else text(sympy.sstr(sympy.nsimplify(constant)))
        base["is_irreducible"] = len(factor_entries) == 1 and factor_entries[0]["multiplicity"] == 1 and factor_entries[0]["degree"] == poly.degree()
        return base
    if op == "roots":
        try:
            # ``ground_roots`` honours the polynomial's own domain: over GF(p)
            # the roots stay in the finite field. ``sympy.roots(expr, x,
            # modulus=p)`` is a no-op for this purpose and returns algebraic
            # (complex) roots instead, e.g. +-I for x^2+1 over GF(5).
            root_map = poly.ground_roots()
        except Exception as exc:
            raise unsupported(f"root finding failed over {domain_name}: {exc}") from exc
        entries = []
        for root, multiplicity in root_map.items():
            entry = expr_result(sympy.nsimplify(root))
            entry["multiplicity"] = int(multiplicity)
            entries.append(entry)
        base["value"] = entries
        base["roots"] = entries
        base["count"] = len(entries)
        return base
    if op == "gcd":
        other_raw = args.get("other")
        if other_raw is None:
            raise bad_request("'other' coefficients are required for gcd")
        other = _parse_poly_from_list(other_raw, p)
        result = poly.gcd(other)
        base["value"] = truncate(str(result.as_expr()).replace("**", "^"))
        base["coeffs"] = [int(c) % p if p else text(sympy.sstr(c)) for c in reversed(result.all_coeffs())]
        return base
    if op == "is_irreducible":
        base["value"] = bool(poly.is_irreducible)
        return base
    if op == "evaluate":
        at_raw = args.get("at", args.get("other", args.get("x")))
        if at_raw is None:
            raise bad_request("'at' is required for evaluate")
        at = parse_number(at_raw, "at")
        value = poly.eval(at) if hasattr(poly, "eval") else poly(at)
        base["value"] = expr_result(sympy.nsimplify(value))
        base["at"] = text(sympy.sstr(at))
        return base
    raise unsupported(f"unsupported polynomial op: {op}")


def _parse_poly_from_list(coeffs_raw, p: int) -> sympy.Poly:
    if not isinstance(coeffs_raw, (list, tuple)) or not coeffs_raw:
        raise bad_request("polynomial coefficients must be a non-empty array")
    x = sympy.Symbol("x")
    coefficients = [int(c) % p if p else sympy.nsimplify(parse_number(c)) for c in coeffs_raw]
    expression = _poly_expr(coefficients)
    return sympy.Poly(expression, x, modulus=p) if p else sympy.Poly(expression, x)


# ---------------------------------------------------------------------------
# Z/nZ
# ---------------------------------------------------------------------------


def _op_ring(args):
    op = str(args.get("op", "")).strip().lower()
    if not op:
        raise bad_request("missing required argument: op")
    n = parse_int_arg(args.get("n"), "n", minimum=2, maximum=10**6)
    table_limit = 1000
    if op in ("units", "zero_divisors"):
        if n > 10**6:
            raise limit_error("modulus too large")
        units = [k for k in range(1, n) if math.gcd(k, n) == 1]
        zero_divisors = [k for k in range(1, n) if math.gcd(k, n) > 1]
        if op == "units":
            return {"op": op, "n": n, "value": units, "count": len(units), "group_order": len(units)}
        return {"op": op, "n": n, "value": zero_divisors, "count": len(zero_divisors)}
    if op == "is_field":
        return {"op": op, "n": n, "value": _is_prime(n)}
    if op == "is_integral_domain":
        return {"op": op, "n": n, "value": _is_prime(n)}
    if op in ("addition_table", "multiplication_table"):
        if n > table_limit:
            raise limit_error(f"tables are limited to n <= {table_limit}")
        if op == "addition_table":
            table = [[(i + j) % n for j in range(n)] for i in range(n)]
        else:
            table = [[(i * j) % n for j in range(n)] for i in range(n)]
        return {"op": op, "n": n, "table": table, "elements": list(range(n))}
    raise unsupported(f"unsupported ring op: {op}")


HANDLERS = {
    "algebra.perm": _op_perm,
    "algebra.group": _op_group,
    "algebra.finitefield": _op_finitefield,
    "algebra.poly": _op_poly,
    "algebra.ring": _op_ring,
}
