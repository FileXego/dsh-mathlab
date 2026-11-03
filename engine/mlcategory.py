"""Finite category theory ops (``category.*``) and concrete Set limits.

Wire format (docs/API.md §category)::

    {
      "objects": [{"id": "A", "label": "A"}],
      "morphisms": [{"id": "f", "dom": "A", "cod": "B", "label": "f"}],
      "identities": [{"object": "A", "morphism": "idA"}],
      "compositions": [{"first": "f", "second": "g", "result": "h"}]
    }

``{"first": f, "second": g, "result": h}`` means ``g ∘ f = h``.
"""

from __future__ import annotations

import itertools

from mlcore import bad_request, domain, sanitize, text, truncate

MAX_OBJECTS = 100
MAX_MORPHISMS = 300
MAX_CATEGORY_COMPOSITES = 20000
MAX_DIAGRAM_PATHS = 60
MAX_DIAGRAM_PATH_LENGTH = 8
MAX_LIMIT_SIZE = 20000


# ---------------------------------------------------------------------------
# Category model
# ---------------------------------------------------------------------------


def _as_id(value, what: str) -> str:
    if isinstance(value, bool) or value is None:
        raise bad_request(f"{what} id must be a string or number")
    if isinstance(value, (int, float)):
        return str(value)
    if isinstance(value, str):
        if not value:
            raise bad_request(f"{what} id must not be empty")
        return value
    raise bad_request(f"{what} id must be a string or number")


class Category:
    """A parsed finite category with a (possibly incomplete) composition table."""

    def __init__(self, raw, name: str = "category"):
        if not isinstance(raw, dict):
            raise bad_request(f"{name} must be an object")
        raw_objects = raw.get("objects")
        raw_morphisms = raw.get("morphisms")
        raw_identities = raw.get("identities", [])
        raw_compositions = raw.get("compositions", [])
        if not isinstance(raw_objects, list):
            raise bad_request(f"{name}.objects must be an array")
        if not isinstance(raw_morphisms, list):
            raise bad_request(f"{name}.morphisms must be an array")
        if not isinstance(raw_identities, list):
            raise bad_request(f"{name}.identities must be an array")
        if not isinstance(raw_compositions, list):
            raise bad_request(f"{name}.compositions must be an array")
        if len(raw_objects) > MAX_OBJECTS:
            raise bad_request(f"{name}: at most {MAX_OBJECTS} objects are supported")
        if len(raw_morphisms) > MAX_MORPHISMS:
            raise bad_request(f"{name}: at most {MAX_MORPHISMS} morphisms are supported")
        if len(raw_compositions) > MAX_CATEGORY_COMPOSITES:
            raise bad_request(f"{name}: composition table too large")
        self.name = name
        self.objects: dict[str, str] = {}
        self.object_order: list[str] = []
        for entry in raw_objects:
            if not isinstance(entry, dict):
                raise bad_request(f"{name}.objects entries must be objects")
            object_id = _as_id(entry.get("id"), "object")
            if object_id in self.objects:
                raise bad_request(f"{name}: duplicate object id {object_id!r}")
            label = entry.get("label")
            self.objects[object_id] = str(label) if label is not None else object_id
            self.object_order.append(object_id)
        self.morphisms: dict[str, dict] = {}
        self.morphism_order: list[str] = []
        for entry in raw_morphisms:
            if not isinstance(entry, dict):
                raise bad_request(f"{name}.morphisms entries must be objects")
            morphism_id = _as_id(entry.get("id"), "morphism")
            if morphism_id in self.morphisms:
                raise bad_request(f"{name}: duplicate morphism id {morphism_id!r}")
            dom = _as_id(entry.get("dom"), "morphism dom")
            cod = _as_id(entry.get("cod"), "morphism cod")
            label = entry.get("label")
            self.morphisms[morphism_id] = {
                "id": morphism_id,
                "dom": dom,
                "cod": cod,
                "label": str(label) if label is not None else morphism_id,
            }
            self.morphism_order.append(morphism_id)
        self.identities: dict[str, str] = {}
        for entry in raw_identities:
            if not isinstance(entry, dict):
                raise bad_request(f"{name}.identities entries must be objects")
            object_id = _as_id(entry.get("object"), "identity object")
            morphism_id = _as_id(entry.get("morphism"), "identity morphism")
            self.identities[object_id] = morphism_id
        self.compositions: dict[tuple[str, str], str] = {}
        self.duplicate_composites: list[tuple[str, str, str]] = []
        for entry in raw_compositions:
            if not isinstance(entry, dict):
                raise bad_request(f"{name}.compositions entries must be objects")
            first = _as_id(entry.get("first"), "first")
            second = _as_id(entry.get("second"), "second")
            result = _as_id(entry.get("result"), "result")
            key = (first, second)
            if key in self.compositions and self.compositions[key] != result:
                self.duplicate_composites.append((first, second, result))
            else:
                self.compositions[key] = result

    # -- queries ------------------------------------------------------------
    def dom(self, morphism: str) -> str | None:
        entry = self.morphisms.get(morphism)
        return entry["dom"] if entry else None

    def cod(self, morphism: str) -> str | None:
        entry = self.morphisms.get(morphism)
        return entry["cod"] if entry else None

    def composite(self, first: str, second: str) -> str | None:
        return self.compositions.get((first, second))

    def composable_pairs(self):
        pairs = []
        for first in self.morphism_order:
            for second in self.morphism_order:
                if self.cod(first) is not None and self.cod(first) == self.dom(second):
                    pairs.append((first, second))
        return pairs

    # -- validation ---------------------------------------------------------
    def validate(self) -> dict:
        violations: list[dict] = []
        summary = {
            "objects": len(self.objects),
            "morphisms": len(self.morphisms),
            "composites": len(self.compositions),
        }

        for object_id in self.object_order:
            if object_id not in self.identities:
                violations.append(
                    {
                        "code": "missing-identity",
                        "message": f"object {object_id!r} has no identity listed",
                        "where": {"object": object_id},
                    }
                )
        for object_id, morphism_id in self.identities.items():
            if object_id not in self.objects:
                violations.append(
                    {
                        "code": "unknown-object",
                        "message": f"identity {morphism_id!r} refers to unknown object {object_id!r}",
                        "where": {"object": object_id, "morphism": morphism_id},
                    }
                )
                continue
            entry = self.morphisms.get(morphism_id)
            if entry is None:
                violations.append(
                    {
                        "code": "unknown-morphism",
                        "message": f"identity {morphism_id!r} of {object_id!r} is not a listed morphism",
                        "where": {"object": object_id, "morphism": morphism_id},
                    }
                )
                continue
            if entry["dom"] != object_id or entry["cod"] != object_id:
                violations.append(
                    {
                        "code": "invalid-identity",
                        "message": (
                            f"identity {morphism_id!r} of {object_id!r} has domain "
                            f"{entry['dom']!r} and codomain {entry['cod']!r}"
                        ),
                        "where": {"object": object_id, "morphism": morphism_id},
                    }
                )
        for morphism_id in self.morphism_order:
            entry = self.morphisms[morphism_id]
            for side in ("dom", "cod"):
                if entry[side] not in self.objects:
                    violations.append(
                        {
                            "code": "unknown-object",
                            "message": f"morphism {morphism_id!r} has unknown {side} {entry[side]!r}",
                            "where": {"morphism": morphism_id},
                        }
                    )
        if self.duplicate_composites:
            for first, second, result in self.duplicate_composites[:20]:
                violations.append(
                    {
                        "code": "conflicting-composite",
                        "message": (
                            f"composition of {first!r} and {second!r} is listed with "
                            f"two different results (including {result!r})"
                        ),
                        "where": {"first": first, "second": second},
                    }
                )

        known_morphisms = set(self.morphisms)
        # composite table sanity
        for (first, second), result in self.compositions.items():
            for name, morphism_id in (("first", first), ("second", second), ("result", result)):
                if morphism_id not in known_morphisms:
                    violations.append(
                        {
                            "code": "unknown-morphism",
                            "message": f"composition references unknown morphism {morphism_id!r}",
                            "where": {"first": first, "second": second, "result": result},
                        }
                    )
            if first not in known_morphisms or second not in known_morphisms:
                continue
            if self.cod(first) != self.dom(second):
                violations.append(
                    {
                        "code": "invalid-composite",
                        "message": (
                            f"composition table contains {second!r} ∘ {first!r} but "
                            f"cod({first!r}) != dom({second!r})"
                        ),
                        "where": {"first": first, "second": second},
                    }
                )
                continue
            if result in known_morphisms:
                expected_dom = self.dom(first)
                expected_cod = self.cod(second)
                if self.dom(result) != expected_dom or self.cod(result) != expected_cod:
                    violations.append(
                        {
                            "code": "invalid-composite",
                            "message": (
                                f"composite {result!r} of {second!r} ∘ {first!r} has type "
                                f"{self.dom(result)!r} -> {self.cod(result)!r}, expected "
                                f"{expected_dom!r} -> {expected_cod!r}"
                            ),
                            "where": {"first": first, "second": second, "result": result},
                        }
                    )

        # completeness of composites
        for first, second in self.composable_pairs():
            if (first, second) not in self.compositions:
                violations.append(
                    {
                        "code": "missing-composite",
                        "message": f"no composite listed for {second!r} ∘ {first!r}",
                        "where": {"first": first, "second": second},
                    }
                )

        # identity laws
        for morphism_id in self.morphism_order:
            entry = self.morphisms[morphism_id]
            dom_id = self.identities.get(entry["dom"])
            cod_id = self.identities.get(entry["cod"])
            if cod_id is not None:
                composite = self.composite(morphism_id, cod_id)
                if composite is not None and composite != morphism_id:
                    violations.append(
                        {
                            "code": "identity-law",
                            "message": f"codomain identity after {morphism_id!r} yields {composite!r}",
                            "where": {"morphism": morphism_id, "law": "right-identity"},
                        }
                    )
            if dom_id is not None:
                composite = self.composite(dom_id, morphism_id)
                if composite is not None and composite != morphism_id:
                    violations.append(
                        {
                            "code": "identity-law",
                            "message": f"domain identity before {morphism_id!r} yields {composite!r}",
                            "where": {"morphism": morphism_id, "law": "left-identity"},
                        }
                    )

        # associativity (bounded by the table sizes)
        checked = 0
        for first, second in self.compositions:
            if first not in known_morphisms or second not in known_morphisms:
                continue
            cod_second = self.cod(second)
            for third in self.morphism_order:
                if self.dom(third) != cod_second:
                    continue
                checked += 1
                left = self.composite(second, third)
                right_first = self.composite(first, second)
                if left is None or right_first is None:
                    continue
                left_full = self.composite(first, left)
                right_full = self.composite(right_first, third)
                if left_full is None or right_full is None:
                    continue
                if left_full != right_full:
                    violations.append(
                        {
                            "code": "non-associative",
                            "message": (
                                f"(h∘g)∘f = {left_full!r} but h∘(g∘f) = {right_full!r} "
                                f"for f={first!r}, g={second!r}, h={third!r}"
                            ),
                            "where": {"first": first, "second": second, "third": third},
                        }
                    )
                if len(violations) > 200:
                    break
            if len(violations) > 200:
                break
        summary["associativity_checks"] = checked
        return {"valid": not violations, "violations": violations, "summary": summary}


def _load_category(raw, name: str = "category") -> Category:
    return Category(raw, name)


# ---------------------------------------------------------------------------
# category.validate / compose
# ---------------------------------------------------------------------------


def category_validate(args: dict) -> dict:
    category = _load_category(args.get("category"))
    return category.validate()


def category_compose(args: dict) -> dict:
    category = _load_category(args.get("category"))
    first = _as_id(args.get("first"), "first")
    second = _as_id(args.get("second"), "second")
    for morphism_id in (first, second):
        if morphism_id not in category.morphisms:
            raise domain(f"unknown morphism: {morphism_id!r}")
    if category.cod(first) != category.dom(second):
        raise domain(
            f"{second!r} ∘ {first!r} is not composable: cod({first!r}) = "
            f"{category.cod(first)!r} but dom({second!r}) = {category.dom(second)!r}"
        )
    result = category.composite(first, second)
    if result is None:
        raise domain(f"the category's composition table has no entry for {second!r} ∘ {first!r}")
    if result not in category.morphisms:
        raise domain(f"composition table returns unknown morphism {result!r}")
    return {
        "result": result,
        "first": first,
        "second": second,
        "dom": category.dom(first),
        "cod": category.cod(second),
        "label": category.morphisms[result]["label"],
    }


# ---------------------------------------------------------------------------
# Functors / natural transformations / diagrams / equivalence
# ---------------------------------------------------------------------------


def _parse_pairs(entries, what: str) -> dict[str, str]:
    if not isinstance(entries, list):
        raise bad_request(f"{what} must be an array of {{from, to}} objects")
    mapping: dict[str, str] = {}
    for entry in entries:
        if not isinstance(entry, dict):
            raise bad_request(f"{what} entries must be objects")
        source = _as_id(entry.get("from"), f"{what} from")
        target = _as_id(entry.get("to"), f"{what} to")
        if source in mapping and mapping[source] != target:
            raise bad_request(f"{what}: {source!r} is mapped twice")
        mapping[source] = target
    return mapping


def _functor_maps(spec) -> tuple[dict, dict]:
    if not isinstance(spec, dict):
        raise bad_request("functor must be an object with onObjects and onMorphisms")
    on_objects = _parse_pairs(spec.get("onObjects"), "onObjects")
    on_morphisms = _parse_pairs(spec.get("onMorphisms"), "onMorphisms")
    return on_objects, on_morphisms


def _check_functor(source: Category, target: Category, on_objects: dict, on_morphisms: dict):
    violations: list[dict] = []
    target_violations = target.validate()["violations"]
    if target_violations:
        violations.append(
            {
                "code": "invalid-target",
                "message": "target category is not a valid category",
                "where": {"violations": len(target_violations)},
            }
        )
    for object_id in source.object_order:
        target_id = on_objects.get(object_id)
        if target_id is None:
            violations.append(
                {
                    "code": "object-map-missing",
                    "message": f"functor is not defined on object {object_id!r}",
                    "where": {"object": object_id},
                }
            )
        elif target_id not in target.objects:
            violations.append(
                {
                    "code": "object-map-invalid",
                    "message": f"F({object_id!r}) = {target_id!r} is not a target object",
                    "where": {"object": object_id},
                }
            )
    for morphism_id in source.morphism_order:
        entry = source.morphisms[morphism_id]
        target_morphism = on_morphisms.get(morphism_id)
        if target_morphism is None:
            violations.append(
                {
                    "code": "morphism-map-missing",
                    "message": f"functor is not defined on morphism {morphism_id!r}",
                    "where": {"morphism": morphism_id},
                }
            )
            continue
        target_entry = target.morphisms.get(target_morphism)
        if target_entry is None:
            violations.append(
                {
                    "code": "morphism-map-invalid",
                    "message": f"F({morphism_id!r}) = {target_morphism!r} is not a target morphism",
                    "where": {"morphism": morphism_id},
                }
            )
            continue
        mapped_dom = on_objects.get(entry["dom"])
        mapped_cod = on_objects.get(entry["cod"])
        if target_entry["dom"] != mapped_dom or target_entry["cod"] != mapped_cod:
            violations.append(
                {
                    "code": "type-mismatch",
                    "message": (
                        f"F({morphism_id!r}) has type {target_entry['dom']!r} -> "
                        f"{target_entry['cod']!r}, expected {mapped_dom!r} -> {mapped_cod!r}"
                    ),
                    "where": {"morphism": morphism_id},
                }
            )
    identity_checks = 0
    identity_failures = []
    for object_id in source.object_order:
        source_identity = source.identities.get(object_id)
        target_object = on_objects.get(object_id)
        if source_identity is None or target_object is None:
            continue
        target_identity = target.identities.get(target_object)
        identity_checks += 1
        mapped_identity = on_morphisms.get(source_identity)
        if mapped_identity != target_identity:
            identity_failures.append(
                {
                    "object": object_id,
                    "F(identity)": mapped_identity,
                    "identity(F(object))": target_identity,
                }
            )
    composition_checks = 0
    composition_failures = []
    for first, second in source.compositions.items():
        source_composite = source.compositions.get((first, second))
        if source_composite is None:
            continue
        composition_checks += 1
        mapped_first = on_morphisms.get(first)
        mapped_second = on_morphisms.get(second)
        mapped_composite = on_morphisms.get(source_composite)
        if mapped_first is None or mapped_second is None or mapped_composite is None:
            continue
        target_composite = target.composite(mapped_first, mapped_second)
        if target_composite != mapped_composite:
            composition_failures.append(
                {
                    "composite": source_composite,
                    "F(composite)": mapped_composite,
                    "F(g)∘F(f)": target_composite,
                }
            )
    for failure in identity_failures[:20]:
        violations.append(
            {
                "code": "identity-law",
                "message": f"F preserves identity at {failure['object']!r} only up to {failure}",
                "where": failure,
            }
        )
    for failure in composition_failures[:20]:
        violations.append(
            {
                "code": "composition-law",
                "message": f"F does not preserve composition: {failure}",
                "where": failure,
            }
        )
    laws = {
        "identity": not identity_failures,
        "composition": not composition_failures,
    }
    details = {
        "identity": {"checked": identity_checks, "failures": identity_failures[:20]},
        "composition": {"checked": composition_checks, "failures": composition_failures[:20]},
    }
    return violations, laws, details


def category_functor(args: dict) -> dict:
    source = _load_category(args.get("source"), "source")
    target = _load_category(args.get("target"), "target")
    on_objects, on_morphisms = _functor_maps(args)
    violations, laws, details = _check_functor(source, target, on_objects, on_morphisms)
    return {"valid": not violations, "violations": violations, "laws": laws, "details": details}


def category_natural(args: dict) -> dict:
    source = _load_category(args.get("source"), "source")
    target = _load_category(args.get("target"), "target")
    f_objects, f_morphisms = _functor_maps(args.get("F"))
    g_objects, g_morphisms = _functor_maps(args.get("G"))
    components_arg = args.get("components")
    if not isinstance(components_arg, list):
        raise bad_request("'components' must be an array of {object, morphism} objects")
    components: dict[str, str] = {}
    for entry in components_arg:
        if not isinstance(entry, dict):
            raise bad_request("components entries must be objects")
        object_id = _as_id(entry.get("object"), "component object")
        morphism_id = _as_id(entry.get("morphism"), "component morphism")
        components[object_id] = morphism_id
    violations: list[dict] = []
    for object_id in source.object_order:
        if object_id not in components:
            violations.append(
                {
                    "code": "missing-component",
                    "message": f"natural transformation has no component at {object_id!r}",
                    "where": {"object": object_id},
                }
            )
    naturality: list[dict] = []
    for morphism_id in source.morphism_order:
        entry = source.morphisms[morphism_id]
        domain_object = entry["dom"]
        codomain_object = entry["cod"]
        component_a = components.get(domain_object)
        component_b = components.get(codomain_object)
        f_morphism = f_morphisms.get(morphism_id)
        g_morphism = g_morphisms.get(morphism_id)
        square = {
            "source": None,
            "target": None,
            "sourceComposite": None,
            "targetComposite": None,
            "ok": False,
        }
        if component_a is None or component_b is None or f_morphism is None or g_morphism is None:
            violations.append(
                {
                    "code": "incomplete-naturality-square",
                    "message": (
                        f"cannot build the naturality square for {morphism_id!r}: missing "
                        "component or functor image"
                    ),
                    "where": {"morphism": morphism_id},
                }
            )
            naturality.append({"object": domain_object, "morphism": morphism_id, "square": square})
            continue
        for name, object_id in (("domain", domain_object), ("codomain", codomain_object)):
            if name == "domain" and f_objects.get(object_id) != target.dom(component_a):
                violations.append(
                    {
                        "code": "component-type-mismatch",
                        "message": (
                            f"component at {object_id!r} does not start at F({object_id!r})"
                        ),
                        "where": {"object": object_id},
                    }
                )
        # G(f) ∘ η_A  and  η_B ∘ F(f)
        source_composite = target.composite(component_a, g_morphism)
        target_composite = target.composite(f_morphism, component_b)
        square["sourceComposite"] = source_composite
        square["targetComposite"] = target_composite
        square["source"] = source_composite
        square["target"] = target_composite
        square["ok"] = source_composite is not None and source_composite == target_composite
        if not square["ok"]:
            violations.append(
                {
                    "code": "naturality",
                    "message": (
                        f"naturality square for {morphism_id!r} does not commute: "
                        f"G(f)∘η_A = {source_composite!r}, η_B∘F(f) = {target_composite!r}"
                    ),
                    "where": {"morphism": morphism_id},
                }
            )
        naturality.append({"object": domain_object, "morphism": morphism_id, "square": square})
    return {
        "valid": not violations,
        "violations": violations,
        "naturality": naturality,
    }


def category_verify_diagram(args: dict) -> dict:
    category = _load_category(args.get("category"))
    pairs_arg = args.get("pairs")
    if not isinstance(pairs_arg, list) or not pairs_arg:
        raise bad_request("'pairs' must be a non-empty array of {from, to} objects")
    if len(pairs_arg) > 50:
        raise bad_request("at most 50 pairs per diagram are supported")
    results = []
    all_ok = True
    identity_morphisms = set(category.identities.values())
    outgoing: dict[str, list[tuple[str, str]]] = {object_id: [] for object_id in category.objects}
    for morphism_id in category.morphism_order:
        if morphism_id in identity_morphisms:
            continue  # identity padding only adds redundant paths to a diagram
        entry = category.morphisms[morphism_id]
        if entry["dom"] in outgoing:
            outgoing[entry["dom"]].append((morphism_id, entry["cod"]))
    for pair in pairs_arg:
        if not isinstance(pair, dict):
            raise bad_request("pairs entries must be objects")
        start = _as_id(pair.get("from"), "pair from")
        end = _as_id(pair.get("to"), "pair to")
        for object_id in (start, end):
            if object_id not in category.objects:
                raise domain(f"unknown object in diagram pair: {object_id!r}")
        paths = _find_paths(outgoing, start, end, MAX_DIAGRAM_PATH_LENGTH, MAX_DIAGRAM_PATHS)
        if start == end:
            identity_path = []
            if identity_path not in paths:
                paths.insert(0, identity_path)
        composites = []
        for path in paths:
            if not path:
                composites.append(category.identities.get(start))
                continue
            composite = path[0]
            for next_morphism in path[1:]:
                composite = category.composite(composite, next_morphism) if composite is not None else None
            composites.append(composite)
        equal = len(composites) > 0 and all(c is not None for c in composites) and len(set(composites)) == 1
        if not equal:
            all_ok = False
        results.append(
            {
                "from": start,
                "to": end,
                "paths": paths,
                "equal": equal,
                "composites": composites,
                "note": None if equal else "paths do not exist or do not commute",
            }
        )
    return {"ok": all_ok, "pairs": results}


def _find_paths(outgoing, start: str, end: str, max_length: int, max_paths: int):
    paths: list[list[str]] = []
    stack: list[tuple[str, list[str]]] = [(start, [])]
    while stack and len(paths) < max_paths:
        node, path = stack.pop()
        if node == end and path:
            paths.append([morphism for morphism, _ in path])
            continue
        if len(path) >= max_length:
            continue
        for morphism, target in outgoing.get(node, []):
            if len(paths) >= max_paths:
                break
            stack.append((target, path + [(morphism, target)]))
    paths.sort(key=lambda item: (len(item), item))
    return paths


def _check_isomorphism(category: Category, source_object: str, target_object: str) -> tuple[bool, list[str]]:
    forward = [
        morphism for morphism in category.morphism_order
        if category.dom(morphism) == source_object and category.cod(morphism) == target_object
    ]
    backward = [
        morphism for morphism in category.morphism_order
        if category.dom(morphism) == target_object and category.cod(morphism) == source_object
    ]
    identity_source = category.identities.get(source_object)
    identity_target = category.identities.get(target_object)
    for u in forward:
        for v in backward:
            if identity_source is None or identity_target is None:
                continue
            if category.composite(u, v) == identity_source and category.composite(v, u) == identity_target:
                return True, [u, v]
    return False, []


def category_equivalence(args: dict) -> dict:
    source = _load_category(args.get("source"), "source")
    target = _load_category(args.get("target"), "target")
    on_objects, on_morphisms = _functor_maps(args.get("functor"))
    violations, laws, details = _check_functor(source, target, on_objects, on_morphisms)
    # faithfulness: distinct source morphisms with the same type must map distinctly
    faithful = True
    seen: dict[tuple[str, str], set[str]] = {}
    for morphism_id in source.morphism_order:
        mapped = on_morphisms.get(morphism_id)
        if mapped is None:
            continue
        entry = source.morphisms[morphism_id]
        key = (entry["dom"], entry["cod"])
        bucket = seen.setdefault(key, set())
        if mapped in bucket:
            faithful = False
            violations.append(
                {
                    "code": "not-faithful",
                    "message": (
                        f"functor identifies morphism {morphism_id!r} with another morphism "
                        f"of type {key[0]!r} -> {key[1]!r}"
                    ),
                    "where": {"morphism": morphism_id},
                }
            )
        bucket.add(mapped)
    # fullness: every target morphism between F(A), F(B) is the image of a source morphism
    full = True
    for domain_object in source.object_order:
        for codomain_object in source.object_order:
            mapped_domain = on_objects.get(domain_object)
            mapped_codomain = on_objects.get(codomain_object)
            if mapped_domain is None or mapped_codomain is None:
                continue
            target_hom = {
                morphism for morphism in target.morphism_order
                if target.dom(morphism) == mapped_domain and target.cod(morphism) == mapped_codomain
            }
            source_images = {
                on_morphisms[morphism] for morphism in source.morphism_order
                if source.morphisms[morphism]["dom"] == domain_object
                and source.morphisms[morphism]["cod"] == codomain_object
                and morphism in on_morphisms
            }
            missing = target_hom - source_images
            if missing:
                full = False
                violations.append(
                    {
                        "code": "not-full",
                        "message": (
                            f"target morphisms {sorted(missing)} between F({domain_object!r}) and "
                            f"F({codomain_object!r}) have no preimage"
                        ),
                        "where": {"domain": domain_object, "codomain": codomain_object},
                    }
                )
    # density (essential surjectivity): every target object is isomorphic to an F(A)
    dense = True
    image_objects = set(on_objects.values())
    for target_object in target.object_order:
        if target_object in image_objects:
            continue
        iso = any(
            _check_isomorphism(target, target_object, image_object)[0]
            for image_object in image_objects
            if image_object is not None
        )
        if not iso:
            dense = False
            violations.append(
                {
                    "code": "not-dense",
                    "message": f"target object {target_object!r} is not isomorphic to any F(A)",
                    "where": {"object": target_object},
                }
            )
    valid = not violations and laws["identity"] and laws["composition"]
    return {
        "valid": valid,
        "violations": violations,
        "faithful": faithful,
        "full": full,
        "dense": dense,
        "laws": laws,
        "details": details,
    }


# ---------------------------------------------------------------------------
# category.limit — concrete finite limits in Set
# ---------------------------------------------------------------------------


def _require_list(value, name: str) -> list:
    if not isinstance(value, list):
        raise bad_request(f"'{name}' must be an array")
    if len(value) > MAX_LIMIT_SIZE:
        raise bad_request(f"'{name}' exceeds the size limit ({MAX_LIMIT_SIZE})")
    return value


def _resolve_map(values, domain: list, codomain: list, name: str) -> list:
    values = _require_list(values, name)
    if len(values) != len(domain):
        raise domain(f"'{name}' must have one value per element of its domain ({len(domain)})")
    codomain_index = {_key(value): index for index, value in enumerate(codomain)}
    if all(isinstance(value, int) and not isinstance(value, bool) for value in values) and codomain and not all(
        isinstance(item, int) and not isinstance(item, bool) for item in codomain
    ):
        resolved = []
        for index in values:
            if not 0 <= index < len(codomain):
                raise domain(f"'{name}' index {index} is out of range")
            resolved.append(codomain[index])
        return resolved
    resolved = []
    for value in values:
        if _key(value) not in codomain_index:
            raise domain(f"'{name}' maps to {value!r}, which is not an element of the codomain")
        resolved.append(value)
    return resolved


def _resolve_values(values, codomain: list, name: str) -> list:
    values = _require_list(values, name)
    if values and all(isinstance(value, int) and not isinstance(value, bool) for value in values) and codomain and not all(
        isinstance(item, int) and not isinstance(item, bool) for item in codomain
    ):
        resolved = []
        for index in values:
            if not 0 <= index < len(codomain):
                raise domain(f"'{name}' index {index} is out of range")
            resolved.append(codomain[index])
        return resolved
    codomain_index = {_key(value) for value in codomain}
    for value in values:
        if _key(value) not in codomain_index:
            raise domain(f"'{name}' refers to {value!r}, which is not an element of the codomain")
    return values


def _key(value):
    """Stable hashable comparison key for lossless JSON values."""
    if isinstance(value, bool):
        return ("bool", value)
    if isinstance(value, (int, float)):
        return ("num", float(value))
    if isinstance(value, str):
        return ("str", value)
    if value is None:
        return ("null",)
    if isinstance(value, list):
        return ("list", tuple(_key(item) for item in value))
    if isinstance(value, dict):
        return ("dict", tuple(sorted((str(k), _key(v)) for k, v in value.items())))
    return ("other", str(value))


def _product(sets: dict, name: str = "product") -> dict:
    if not isinstance(sets, dict) or not sets:
        raise bad_request("product requires a non-empty 'sets' object")
    keys = list(sets)
    collections = []
    for key in keys:
        values = _require_list(sets[key], f"sets.{key}")
        collections.append(values)
    object_rows = [[sanitize(value) for value in row] for row in itertools.product(*collections)]
    projections = {key: [row[index] for row in object_rows] for index, key in enumerate(keys)}
    return {
        "kind": name,
        "object": object_rows,
        "projections": projections,
        "universal": {
            "verified": True,
            "note": "constructed as the full product set; the projections are the aligned coordinate maps",
        },
    }


def _coproduct(sets: dict) -> dict:
    if not isinstance(sets, dict) or not sets:
        raise bad_request("coproduct requires a non-empty 'sets' object")
    object_rows = []
    injections: dict[str, list[int]] = {}
    for key, values in sets.items():
        values = _require_list(values, f"sets.{key}")
        indices = []
        for value in values:
            indices.append(len(object_rows))
            object_rows.append({"tag": key, "value": sanitize(value)})
        injections[key] = indices
    return {
        "kind": "coproduct",
        "object": object_rows,
        "injections": injections,
        "universal": {
            "verified": True,
            "note": "disjoint union with tagged elements; injections are the aligned index maps",
        },
    }


def _equalizer(args: dict) -> dict:
    domain_values = _require_list(args.get("domain"), "domain")
    domain = [sanitize(value) for value in domain_values]
    if "codomain" in args and isinstance(args.get("codomain"), list):
        codomain = [sanitize(value) for value in args["codomain"]]
    else:
        codomain = None
    f_raw = _require_list(args.get("f"), "f")
    g_raw = _require_list(args.get("g"), "g")
    if codomain is None:
        # values name their own codomain; compare directly by key
        if len(f_raw) != len(domain) or len(g_raw) != len(domain):
            raise domain("'f' and 'g' need one value per element of 'domain'")
        equal_indices = [index for index in range(len(domain)) if _key(f_raw[index]) == _key(g_raw[index])]
        return {
            "kind": "equalizer",
            "object": equal_indices,
            "map": equal_indices,
            "values": [domain[index] for index in equal_indices],
            "universal": {"verified": True, "note": "equalizer subset of the domain, inclusion as the map"},
        }
    f_resolved = _resolve_map(f_raw, domain, codomain, "f")
    g_resolved = _resolve_map(g_raw, domain, codomain, "g")
    equal_indices = [index for index in range(len(domain)) if _key(f_resolved[index]) == _key(g_resolved[index])]
    return {
        "kind": "equalizer",
        "object": equal_indices,
        "map": equal_indices,
        "values": [domain[index] for index in equal_indices],
        "universal": {"verified": True, "note": "equalizer subset of the domain, inclusion as the map"},
    }


def _coequalizer(args: dict) -> dict:
    codomain = [sanitize(value) for value in _require_list(args.get("codomain"), "codomain")]
    f_values = _resolve_values(args.get("f"), codomain, "f")
    g_values = _resolve_values(args.get("g"), codomain, "g")
    if len(f_values) != len(g_values):
        raise domain("'f' and 'g' must be parallel maps (same length)")
    parent = list(range(len(codomain)))

    def find(index: int) -> int:
        while parent[index] != index:
            parent[index] = parent[parent[index]]
            index = parent[index]
        return index

    def union(a: int, b: int) -> None:
        root_a, root_b = find(a), find(b)
        if root_a != root_b:
            parent[root_b] = root_a

    index_of = {_key(value): index for index, value in enumerate(codomain)}
    for left, right in zip(f_values, g_values):
        union(index_of[_key(left)], index_of[_key(right)])
    groups: dict[int, list] = {}
    for index, value in enumerate(codomain):
        groups.setdefault(find(index), []).append(value)
    class_order = sorted(groups, key=lambda root: min(index_of[_key(value)] for value in groups[root]))
    class_index = {}
    classes = []
    for order, root in enumerate(class_order):
        members = groups[root]
        classes.append([sanitize(value) for value in members])
        for value in members:
            class_index[_key(value)] = order
    quotient_map = [class_index[_key(value)] for value in codomain]
    return {
        "kind": "coequalizer",
        "object": classes,
        "quotientMap": quotient_map,
        "universal": {"verified": True, "note": "quotient of the codomain by the relation generated by f(x) ~ g(x)"},
    }


def _pullback(args: dict) -> dict:
    A = [sanitize(value) for value in _require_list(args.get("A"), "A")]
    B = [sanitize(value) for value in _require_list(args.get("B"), "B")]
    C = [sanitize(value) for value in _require_list(args.get("C"), "C")]
    f = _resolve_map(args.get("f"), A, C, "f")
    g = _resolve_map(args.get("g"), B, C, "g")
    rows = []
    left = []
    right = []
    for index_a, value_a in enumerate(A):
        for index_b, value_b in enumerate(B):
            if _key(f[index_a]) == _key(g[index_b]):
                rows.append([value_a, value_b])
                left.append(value_a)
                right.append(value_b)
    return {
        "kind": "pullback",
        "object": rows,
        "projections": {"A": left, "B": right},
        "universal": {
            "verified": True,
            "note": "object is the set of pairs (a, b) with f(a) = g(b); projections are aligned with it",
        },
    }


def _pushout(args: dict) -> dict:
    C = [sanitize(value) for value in _require_list(args.get("C"), "C")]
    A = [sanitize(value) for value in _require_list(args.get("A"), "A")]
    B = [sanitize(value) for value in _require_list(args.get("B"), "B")]
    f = _resolve_map(args.get("f"), C, A, "f")
    g = _resolve_map(args.get("g"), C, B, "g")
    # disjoint union: A elements at 0..|A|-1, B elements at |A|..|A|+|B|-1
    parent = list(range(len(A) + len(B)))

    def find(index: int) -> int:
        while parent[index] != index:
            parent[index] = parent[parent[index]]
            index = parent[index]
        return index

    def union(a: int, b: int) -> None:
        root_a, root_b = find(a), find(b)
        if root_a != root_b:
            parent[root_b] = root_a

    for index_c, _ in enumerate(C):
        index_a = A.index(f[index_c]) if f[index_c] in A else None
        index_b = B.index(g[index_c]) if g[index_c] in B else None
        if index_a is None or index_b is None:  # pragma: no cover - resolver guarantees membership
            raise domain("pushout maps must land in their codomains")
        union(index_a, len(A) + index_b)
    groups: dict[int, list] = {}
    for index, value in enumerate(A):
        groups.setdefault(find(index), []).append({"tag": "A", "value": value})
    for index, value in enumerate(B):
        groups.setdefault(find(len(A) + index), []).append({"tag": "B", "value": value})
    roots = sorted(groups)
    class_index = {}
    classes = []
    for root in roots:
        class_index[root] = len(classes)
        classes.append(groups[root])
    injections = {
        "A": [class_index[find(index)] for index in range(len(A))],
        "B": [class_index[find(len(A) + index)] for index in range(len(B))],
    }
    return {
        "kind": "pushout",
        "object": classes,
        "injections": injections,
        "universal": {
            "verified": True,
            "note": "disjoint union of A and B quotiented by f(c) ~ g(c); injections are aligned index maps",
        },
    }


def category_limit(args: dict) -> dict:
    kind = args.get("kind")
    if not isinstance(kind, str):
        raise bad_request("'kind' is required for category.limit")
    kind = kind.strip().lower()
    if kind == "product":
        return _product(args.get("sets"))
    if kind == "coproduct":
        return _coproduct(args.get("sets"))
    if kind == "equalizer":
        return _equalizer(args)
    if kind == "coequalizer":
        return _coequalizer(args)
    if kind == "pullback":
        return _pullback(args)
    if kind == "pushout":
        return _pushout(args)
    if kind == "terminal":
        sets = args.get("sets")
        if sets is not None and not isinstance(sets, dict):
            raise bad_request("'sets' must be an object when supplied")
        return {
            "kind": "terminal",
            "object": [None],
            "universal": {"verified": True, "note": "the terminal object is the singleton set"},
        }
    if kind == "initial":
        return {
            "kind": "initial",
            "object": [],
            "universal": {"verified": True, "note": "the initial object is the empty set"},
        }
    raise bad_request(f"unsupported limit kind: {kind!r}")


def _limit_safe(args: dict) -> dict:
    """Turn malformed concrete-limit inputs into a typed bad-request error."""
    try:
        return category_limit(args)
    except (KeyError, TypeError, IndexError, ValueError) as exc:
        raise bad_request(f"malformed category.limit input: {exc}") from exc


HANDLERS = {
    "category.validate": category_validate,
    "category.compose": category_compose,
    "category.functor": category_functor,
    "category.natural": category_natural,
    "category.verify_diagram": category_verify_diagram,
    "category.limit": _limit_safe,
    "category.equivalence": category_equivalence,
}
