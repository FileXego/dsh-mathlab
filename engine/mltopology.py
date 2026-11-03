"""Topology ops (``topology.*``): simplicial homology and graph fundamental groups."""

from __future__ import annotations

import sympy
from sympy.matrices.normalforms import smith_normal_form

from mlcore import (
    EngineError,
    bad_request,
    domain,
    limit_error,
    sanitize,
    text,
    truncate,
)

MAX_SIMPLICES = 4000
MAX_DIMENSION = 8
MAX_VERTICES = 400


def _key(vertex) -> str:
    return repr(vertex)


class SimplicialComplex:
    def __init__(self, raw, auto_add_faces: bool = True):
        if not isinstance(raw, dict) or not raw:
            raise bad_request("'simplices' must be an object mapping dimension -> simplex list")
        notes: list[str] = []
        self.simplices: dict[int, list[tuple[str, ...]]] = {}
        self.vertex_order: list[str] = []
        self.vertex_labels: dict[str, object] = {}
        seen: dict[int, set[tuple[str, ...]]] = {}
        for dimension_key, entries in raw.items():
            try:
                dimension = int(dimension_key)
            except (TypeError, ValueError) as exc:
                raise bad_request(f"simplex dimension key {dimension_key!r} is not an integer") from exc
            if not 0 <= dimension <= MAX_DIMENSION:
                raise limit_error(f"simplex dimension {dimension} exceeds limit {MAX_DIMENSION}")
            if not isinstance(entries, list):
                raise bad_request(f"simplices[{dimension_key!r}] must be an array")
            bucket = seen.setdefault(dimension, set())
            for entry in entries:
                if not isinstance(entry, list):
                    raise bad_request(f"each {dimension}-simplex must be an array of vertices")
                if len(entry) != dimension + 1:
                    raise domain(
                        f"{dimension}-simplex {entry!r} has {len(entry)} vertices; expected {dimension + 1}"
                    )
                vertex_keys = []
                for vertex in entry:
                    key = _key(vertex)
                    if key in vertex_keys:
                        raise domain(f"simplex {entry!r} repeats vertex {vertex!r}")
                    if key not in self.vertex_labels:
                        if len(self.vertex_labels) >= MAX_VERTICES:
                            raise limit_error(f"complex exceeds {MAX_VERTICES} vertices")
                        self.vertex_labels[key] = vertex
                        self.vertex_order.append(key)
                    vertex_keys.append(key)
                canonical = tuple(sorted(vertex_keys))
                bucket.add(canonical)
        # ensure every vertex appears as a 0-simplex
        zero_simplices = seen.setdefault(0, set())
        for key in self.vertex_order:
            if (key,) not in zero_simplices:
                zero_simplices.add((key,))
                notes.append(f"added missing vertex simplex {self.vertex_labels[key]!r}")
        if auto_add_faces:
            maximum = max(seen) if seen else 0
            for dimension in range(1, maximum + 1):
                for simplex in list(seen.get(dimension, set())):
                    for face in _faces(simplex):
                        if face not in seen.get(dimension - 1, set()):
                            seen.setdefault(dimension - 1, set()).add(face)
                            notes.append(f"added missing face {tuple(self.vertex_labels[v] for v in face)!r}")
        total = sum(len(bucket) for bucket in seen.values())
        if total > MAX_SIMPLICES:
            raise limit_error(f"complex exceeds {MAX_SIMPLICES} simplices")
        self.notes = notes
        self.dimension = max(seen) if seen else 0
        for dimension in range(self.dimension + 1):
            bucket = seen.get(dimension, set())
            ordered = sorted(bucket, key=lambda simplex: tuple(self.vertex_order.index(v) for v in simplex))
            self.simplices[dimension] = ordered
        # chain ranks include every dimension up to the top even if empty
        self.chain_ranks = [len(self.simplices.get(dimension, [])) for dimension in range(self.dimension + 1)]

    def boundary_matrix(self, dimension: int) -> sympy.Matrix:
        if dimension < 1 or dimension > self.dimension:
            return sympy.zeros(0, 0)
        rows = {simplex: index for index, simplex in enumerate(self.simplices[dimension - 1])}
        columns = self.simplices[dimension]
        matrix = sympy.zeros(len(rows), len(columns))
        for column, simplex in enumerate(columns):
            for position in range(len(simplex)):
                face = simplex[:position] + simplex[position + 1 :]
                row = rows.get(face)
                if row is None:  # pragma: no cover - faces are auto-added
                    raise domain(f"missing boundary face {face!r}")
                matrix[row, column] += (-1) ** position
        return matrix


def _faces(simplex: tuple[str, ...]):
    for position in range(len(simplex)):
        yield simplex[:position] + simplex[position + 1 :]


def _smith_torsion(matrix: sympy.Matrix) -> list[int]:
    if matrix.rows == 0 or matrix.cols == 0:
        return []
    if matrix.is_zero_matrix:
        return []
    try:
        normal_form = smith_normal_form(matrix, domain=sympy.ZZ)
    except Exception:  # pragma: no cover - defensive fallback
        return []
    diagonal = []
    for index in range(min(normal_form.rows, normal_form.cols)):
        value = int(normal_form[index, index])
        if value < 0:
            value = -value
        if value > 1:
            diagonal.append(value)
    return diagonal


def op_homology(args: dict) -> dict:
    complex_ = SimplicialComplex(args.get("simplices"))
    maximum = complex_.dimension
    boundary_matrices = {}
    ranks = {0: 0}
    for dimension in range(1, maximum + 1):
        matrix = complex_.boundary_matrix(dimension)
        boundary_matrices[dimension] = matrix
        ranks[dimension] = matrix.rank()
    ranks[maximum + 1] = 0
    betti = []
    torsion = []
    for dimension in range(maximum + 1):
        chain_rank = complex_.chain_ranks[dimension]
        boundary_rank = ranks.get(dimension, 0)
        next_boundary_rank = ranks.get(dimension + 1, 0)
        free = chain_rank - boundary_rank - next_boundary_rank
        betti.append(int(max(0, free)))
    for dimension in range(maximum + 1):
        if dimension + 1 <= maximum:
            torsion.append(_smith_torsion(boundary_matrices.get(dimension + 1, sympy.zeros(0, 0))))
        else:
            torsion.append([])
    euler = 0
    for dimension in range(maximum + 1):
        euler += (-1) ** dimension * complex_.chain_ranks[dimension]
    notes = list(complex_.notes[:20])
    if len(complex_.notes) > 20:
        notes.append(f"... {len(complex_.notes) - 20} more face/vertex additions omitted")
    notes.append(
        "orientation: each simplex is sorted by first appearance of its vertices; "
        "boundary entries are (-1)**i for the i-th removed vertex"
    )
    labels = {}
    for key, label in complex_.vertex_labels.items():
        labels[truncate(str(label))] = key
    return {
        "betti": betti,
        "torsion": torsion,
        "chain_ranks": complex_.chain_ranks,
        "euler": int(euler),
        "boundary_matrices": {
            str(dimension): [[int(matrix[i, j]) for j in range(matrix.cols)] for i in range(matrix.rows)]
            for dimension, matrix in boundary_matrices.items()
        },
        "dimension": maximum,
        "simplex_counts": {str(d): len(complex_.simplices.get(d, [])) for d in range(maximum + 1)},
        "vertices": [sanitize(complex_.vertex_labels[key]) for key in complex_.vertex_order],
        "note": " | ".join(notes),
    }


# ---------------------------------------------------------------------------
# Fundamental group of a graph
# ---------------------------------------------------------------------------


def op_fundamental_group(args: dict) -> dict:
    vertices = args.get("vertices")
    edges = args.get("edges")
    if not isinstance(vertices, list) or not vertices:
        raise bad_request("'vertices' must be a non-empty array")
    if not isinstance(edges, list):
        raise bad_request("'edges' must be an array of [u, v] pairs")
    if len(vertices) > MAX_VERTICES:
        raise limit_error(f"at most {MAX_VERTICES} vertices are supported")
    if len(edges) > MAX_SIMPLICES:
        raise limit_error(f"at most {MAX_SIMPLICES} edges are supported")
    notes: list[str] = []
    order: list[str] = []
    lookup: dict[str, object] = {}

    def register(vertex):
        key = _key(vertex)
        if key not in lookup:
            lookup[key] = vertex
            order.append(key)
        return key

    for vertex in vertices:
        register(vertex)
    normalized_edges = []
    for index, edge in enumerate(edges):
        if not isinstance(edge, (list, tuple)) or len(edge) < 2:
            raise bad_request(f"edge {index} must be a [u, v] pair")
        source = register(edge[0])
        target = register(edge[1])
        normalized_edges.append((index, source, target))
    if len(order) != len(vertices):
        notes.append("some vertices appeared only inside edges and were added")
    parent = {key: key for key in order}
    rank = {key: 0 for key in order}

    def find(key: str) -> str:
        while parent[key] != key:
            parent[key] = parent[parent[key]]
            key = parent[key]
        return key

    def union(a: str, b: str) -> bool:
        root_a, root_b = find(a), find(b)
        if root_a == root_b:
            return False
        if rank[root_a] < rank[root_b]:
            root_a, root_b = root_b, root_a
        parent[root_b] = root_a
        if rank[root_a] == rank[root_b]:
            rank[root_a] += 1
        return True

    tree_edges = set()
    for index, source, target in normalized_edges:
        if union(source, target):
            tree_edges.add(index)
    components = len({find(key) for key in order})
    generator_entries = []
    counter = 0
    for index, source, target in normalized_edges:
        if index in tree_edges:
            continue
        loop = "loop" if source == target else "edge"
        name = f"g{counter}"
        generator_entries.append(
            {
                "name": name,
                "label": f"e{counter}",
                "edge": [sanitize(lookup[source]), sanitize(lookup[target])],
                "kind": loop,
                "index": index,
            }
        )
        counter += 1
    generator_names = [entry["name"] for entry in generator_entries]
    betti1 = max(0, len(normalized_edges) - len(order) + components)
    if len(generator_entries) != betti1:
        # loops/parallel edges are counted correctly by the cycle rank; keep the
        # generator list authoritative.
        betti1 = len(generator_entries)
    abelianization = "Z^0" if betti1 == 0 else f"Z^{betti1}" if betti1 > 1 else "Z"
    notes.append("fundamental group of a graph is free: no relations")
    notes.append("abelianization is Z^rank (no torsion for graphs)")
    return {
        "generators": generator_names,
        "generator_details": generator_entries,
        "relations": [],
        "abelianization": abelianization,
        "abelianization_rank": betti1,
        "betti1": betti1,
        "vertices": len(order),
        "edges": len(normalized_edges),
        "components": components,
        "spanning_tree_edges": [normalized_edges_index for normalized_edges_index in sorted(tree_edges)],
        "note": " | ".join(notes),
    }


HANDLERS = {
    "topology.homology": op_homology,
    "topology.fundamental_group": op_fundamental_group,
}
