# MathLab Live Stage — agent ↔ panel interaction protocol

A **stage** is the shared, live "blackboard" inside the MathLab panel and inside the
conversation (dock). The agent writes (structure + narrative + judgments + drawings) and
the user reads, steps through, annotates and asks; the stage persists in the host across
turns and is readable back by the agent.

- Panel tab: `讲解 / Stage` (new first tab), plus `过程轨迹 / Trace` for the automatic
  record of every math operation the agent performed.
- **One stage per Session**: the host keys stages by Session id; the conversation dock
  shows its own Session's stage, the main panel (no session) shows the most recently
  updated one. Revision counters drive an **SSE push** stream plus a ~900 ms poll fallback.
- The agent-facing tool is `mathlab_stage`; the same operations are available over
  `POST /mathlab/api` (used by the panel and by tests):
  `stage.get`, `stage.set`, `stage.append`, `stage.update`, `stage.annotate`,
  `stage.question`, `stage.cursor`, `stage.export`, `stage.clear`.

## Stage document

```json
{
  "id": "stg_...",
  "revision": 7,
  "title": "为什么 √2 不是有理数",
  "subtitle": "反证法 · 良序与奇偶性 · 可迁移的“最小反例”模式",
  "status": "live",
  "autoShow": true,
  "focus": 3,
  "blocks": [ { "id": "b1", "kind": "...", "...": "..." } ],
  "takeaway": { "claim": "...", "method": "...", "generalization": "...", "scope": "...", "references": ["..."] },
  "trace": [ { "at": "...", "source": "tool", "tool": "mathlab", "op": "logic.prove", "args": {}, "summary": "...", "result": {} } ],
  "annotations": [ { "id": "an_...", "blockId": "b3", "note": "这里没看懂", "at": "..." } ],
  "questions": [ { "id": "q_...", "blockId": "b3", "text": "为什么要假设互素？", "at": "..." } ],
  "cursor": { "index": 3, "blockId": "b3", "at": "..." },
  "presentedBy": { "sessionId": "..." },
  "createdAt": "...", "updatedAt": "..."
}
```

## Block kinds (agent-authored; all other keys are optional unless marked)

Text fields accept a **safe markdown-lite**: paragraphs on blank lines, `**bold**`,
`` `code` ``, `$inline latex$`, `$$display latex$$` on its own line, `- ` list items.

| kind | required fields | meaning / rendering |
| --- | --- | --- |
| `heading` | `text` | section heading; `level` 1–3 (default 2) |
| `prose` | `text` | narrative; `tone`: `neutral\|insight\|warning\|question` |
| `math` | `latex` | display formula; `caption?` |
| `judgment` | `claim`, `verdict`, `reason` | one explicit step of judgment. `verdict`: `goal` (what we want), `assume` (introduced assumption), `have` (established), `rule` (a rule/definition applied), `check` (verification), `contradiction`, `conclusion`. `rule?` names it (e.g. `→I`, `反证法`, `归纳假设`), `symbols?` symbol-atlas ids. Rendered as a card with a semantic color. **This is the core "thinking judgment" primitive.** |
| `strategy` | `root` | thought/approach tree; `title?`, `root`: `{label, detail?, kind?: 'goal\|subgoal\|method\|branch\|result', children?: [...]}` (depth ≤ 6, nodes ≤ 80). Rendered as an indented tree/graph. |
| `proof` | `fitch` or `nodes` | natural-deduction proof. Preferred `fitch: [{line, indent, text, rule, refs?}]` plus `valid`, `goal?`, `title?`, `nodes?` (proof tree from `logic.prove`). Interactive step-through. |
| `diagram` | `diagram` object | reuse category renderers: `{kind: 'category', category: {...}, verify?: {...}, title?}` or `{kind: 'hasse', nodes:[...], edges:[...], normalEdges?, title?}` or `{kind:'cayley', elements:[...], table:[[...]], title?}` or `{kind:'strategy-graph'}` (alias of strategy). |
| `plot` | `op`, `args` | live interactive plot; `op` ∈ `plot.sample\|plot.sample_multi\|plot.parametric\|plot.polar\|plot.implicit\|plot.surface3d\|plot.field`; `title?`, `caption?`. The panel fetches the data through the normal API and renders it with the shared 2D/3D renderer. |
| `compute` | `op`, `args` | show one computation: input, result (pretty + LaTeX), notes; `title?`. If `result` is supplied the panel renders it, otherwise it runs the op itself. |
| `symbols` | `ids` or `query` | notation chips from the symbol atlas (glyph + zh/en name + LaTeX + Lean name). `title?`, `field?`, `limit?`. |
| `lean` | `code` | Lean 4 snippet card with `title?`, `imports?`, `diagnostics?`; optional `check: true` makes the panel run `lean.check` on demand. |
| `takeaway` | `claim`, `method`, `generalization`, `scope` | "public/generalizable value" card; `references?: string[]`, `examples?: string[]`. Rendered at the bottom if not supplied as top-level `takeaway`. |
| `note` | `text` | a small annotatable aside. |

Guards: blocks ≤ 120, serialized stage ≤ 256 KiB, text ≤ 8000 chars each, unknown block
kinds are displayed as a JSON fallback (never crash). Block ids are auto-assigned (`b1`,
`b2`, …) when omitted.

## Operations (HTTP & agent tool)

- `stage.get {}` → `{stage, revision}` (panel polls; also the agent reads annotations/questions).
- `stage.set {title, subtitle?, blocks?, takeaway?, autoShow?, focus?, status?}` → replaces the stage, new revision, `presentedBy.sessionId` from the tool's calling session.
- `stage.append {blocks}` → appends; `focus` untouched.
- `stage.update {title?, subtitle?, focus?, autoShow?, status?}` → partial edit.
- `stage.annotate {blockId?, note}` → user note (panel; returned to agent by `get`).
- `stage.question {blockId?, text}` → user question (panel; copy-to-chat affordance; agent reads next turn).
- `stage.cursor {index, blockId?}` → panel's viewed step (agent can say "你现在停在第 3 步…").
- `stage.export {format?: 'markdown'|'latex'}` → `{markdown, filename}` built from title, blocks, takeaway, references (no annotations by default).
- `stage.clear {}`.

## Agent workflow (put into practice)

When explaining/teaching mathematics in a conversation:

1. At the start of a math answer, call `mathlab_stage` with action `get` to see whether the
   learner left annotations/questions or is looking at a step.
2. Compose the board **before or while** explaining: `present` with a `strategy` block (the
   plan), one `judgment` block per reasoning step, `math`/`proof`/`plot`/`diagram` blocks for
   the formal and visual content, `symbols` for the logical language, and a final `takeaway`
   for the generalizable pattern.
3. Keep the chat response short and point at the stage ("看第 3 步"); use `update focus` to
   move the live cursor as you narrate.
4. After verification, `stage.export` (or tell the user to press 导出) for shareable notes.
5. Every `mathlab`, `mathlab_plot`, `mathlab_lean`, `mathlab_reference` call is automatically
   appended to the stage's `trace`, so the learner can audit the raw computation behind the
   narrative.

## Panel behaviour

- Polls `stage.get` every ~900 ms; revision change → content update, auto-switch to the Stage
  tab when `autoShow` is on and the user has not just manually switched tabs.
- Step navigation: `←`/`→`, prev/next buttons, index; "跟随讲解" (host focus) vs "自由查看".
- Block interactions: proof step-through/tree toggle; plot zoom/pan/3D rotate; diagram
  hover; symbol chips copy LaTeX; annotations per block; question box; "导出 Markdown";
  "复制本步 LaTeX".
- Trace tab: reverse-chronological tool calls with op/args/result, expandable JSON, "复制".
- Empty state explains how to ask: "在对话里说：用 MathLab 讲解/展示这道题".

## Per-Session stages and realtime

There is **one stage per Session**. The agent tools pass the calling Session id, the
conversation dock reads its own Session's stage, and `stage.get` without a `sessionId`
returns the most recently updated stage (the MathLab main panel keeps working as a global
view).

- Every stage op accepts an optional `sessionId`; annotations, questions, cursor and
  export are scoped to that Session too.
- Push: `GET /mathlab/events?sessionId=…` is a Server-Sent-Events stream
  (`text/event-stream`, `Cache-Control: no-transform`). It sends the current revision on
  connect, then `event: stage` frames `{sessionId, revision}` on every mutation, plus a
  heartbeat every 15 s. The conversation dock and the main panel subscribe; both keep a low
  frequency poll as fallback, so a blocked EventSource only loses latency.

## Conversation dock (in the chat frame)

Registered into the `conversation.input.dock` slot (Session-scoped, order 35), so the stage
lives **inside the conversation**: above the composer there is a compact bar

```
讲解舞台   P vs NP：等价表述能弱化到多少个层级？     第 6/31 步 · rev 7     展开
```

- Hidden until the current Session's stage has blocks.
- The dock bar carries a **placement switch — 右侧 / 内嵌 / 关闭** (`stage.surface` in
  localStorage). Exactly one surface is shown: the native right-sidebar tab, the inline
  body, or nothing (the bar alone stays so the switch is always reachable).
- **Right = native split view**: the plugin registers a tab type in DSH's own right
  Sidebar (`ctx.sidebarRightTabs.register`, the keyed `sidebar.right.pane.tab` body seat,
  its title seat, and a guide capsule on the 开始 page). Opening uses
  `ctx.sidebarRight.openTab('mathlab-stage')`; switching away tries `closeTab` and falls
  back to collapsing the column. This is a real layout change — the conversation column
  narrows — not a floating overlay, and the guide page gets a standalone 讲解 button next
  to the host's own plugin buttons.
- `内嵌` keeps the inline expansion (max-height ~62 vh with its own scroll container,
  annotations/questions/export/trace all available).
- The dock bar and every viewer update live from the SSE revision stream; the agent moving
  `focus` moves the step counter and the viewer's step (when 跟随讲解 is on).

### Placement preferences

Two independent switches live in the MathLab 讲解 tab's **插件选项** bar (and persist in
localStorage): `下侧栏` controls the conversation dock/inline surface; `右侧栏` controls the
native right-Sidebar tab and its guide capsule. Both default to on. Turning the right one
off disposes the native tab registration (guide entry and title seat included); turning it
back on re-registers it. Turning the bottom one off makes the dock render nothing, so the
conversation is untouched; the global MathLab panel remains the place to re-enable either.
The dock's surface switch only offers surfaces whose preference is enabled.

### Pinned controls and zoom (native tab and inline dock)

Both the native right-sidebar tab and the inline dock render `StageTab` with `pinned`:
the **control menu** (status, prev/next, follow/free, 讲解/过程轨迹, copy/export, step strip,
zoom) is a sticky header; blocks, annotations, questions and the takeaway scroll beneath
it. Jumping to a step keeps the controls visible, so going back up never requires finding
the wheel. `scroll-margin-top` keeps the focused block below the sticky bar.

The zoom bar (`A− / percentage / A+ / ⟲`) applies CSS `zoom` to the reading body only
(75%–175%, persisted as `stage.zoom`), so formulas, tables and figures scale together while
the controls stay at 100%; plot blocks keep their own pan/zoom interaction.
- Per-Session isolation: conversations never see each other's stages; the main MathLab
  panel shows the latest stage globally.

## Selection questions and symbol connection

- **划词提问 + send to chat**: selecting text inside any block shows a floating
  `划词提问` pill; the popover quotes the selection, records `stage.question {blockId, text}`
  (the quote is embedded in the question text, so old hosts also keep it), copies it, and
  — on hosts that expose the conversation service — appends the quoted question to the
  session's composer draft in one click. Annotations remain per block.
- **Symbol → step connections**: judgment blocks render symbol chips; clicking a chip sets
  the active symbol, highlights every block that cites it and shows a banner listing the
  step numbers. The `symbols` block adds a `符号 → 步骤` connection list **and a bipartite
  symbol–step graph**; symbols and step labels are both clickable. This makes the logical
  notation and its usage auditable rather than decorative.
