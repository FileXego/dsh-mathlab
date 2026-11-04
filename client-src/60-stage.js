/* 60-stage — the Live Stage panel: the agent's shared blackboard.
 *
 * Renders the stage document frozen in docs/STAGE.md: heading / prose / math /
 * judgment / strategy / proof / diagram / plot / compute / symbols / lean /
 * takeaway / note blocks, with per-block annotations, a question box, step
 * navigation, trace view, Markdown export and the ~900 ms stage.get poll.
 *
 * The Host side of the stage is being implemented in parallel; every response is
 * treated as best-effort data (never trusted structurally) so a partial or
 * malformed answer degrades to a readable fallback instead of a crash.
 */
(function () {
  'use strict';

  const useState = React.useState;
  const useEffect = React.useEffect;
  const useRef = React.useRef;
  const useMemo = React.useMemo;
  const useCallback = React.useCallback;

  /* ------------------------------------------------------------------ styles */

  ML.CSS =
    (ML.CSS || '') +
    `/* ---------- Live Stage ---------- */
.stage-root { display: flex; flex-direction: column; gap: 14px; }
.stage-hd {
  display: flex; flex-direction: column; gap: 10px;
  border: 0.5px solid var(--ml-b1); border-radius: 12px;
  background: var(--ml-l1); padding: 14px 16px;
}
.stage-hd-main { display: flex; align-items: flex-start; justify-content: space-between; gap: 14px; flex-wrap: wrap; }
.stage-hd-text { min-width: 0; flex: 1 1 320px; }
.stage-title { margin: 0; font-size: 17px; font-weight: 600; line-height: 1.35; letter-spacing: 0.1px; overflow-wrap: anywhere; }
.stage-subtitle { margin: 3px 0 0; font-size: 12.5px; line-height: 1.5; color: var(--ml-fg2); overflow-wrap: anywhere; }
.stage-pills { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
.stage-status-dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; flex: none; }
.stage-pill-live .stage-status-dot { animation: ml-pulse 1.1s ease-in-out infinite; }
.stage-sync { font-size: 11px; color: var(--ml-fg2); white-space: nowrap; }
.stage-tools { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; border-top: 0.5px solid var(--ml-b1); padding-top: 10px; }
.stage-nav { display: flex; align-items: center; gap: 6px; }
.stage-step-label { font-size: 12px; color: var(--ml-fg2); font-variant-numeric: tabular-nums; text-align: center; min-width: 74px; }
.stage-spacer { flex: 1 1 auto; }
.stage-follow.is-active { color: var(--ml-brand); background: var(--ml-active); border-color: color-mix(in srgb, var(--ml-brand) 40%, transparent); }
.stage-toast { display: inline-flex; align-self: flex-start; max-width: 100%; }

.stage-steps { display: flex; gap: 4px; overflow-x: auto; padding: 2px 0 4px; scrollbar-width: thin; }
.stage-step-btn {
  appearance: none; cursor: pointer; flex: none; min-width: 26px; height: 24px;
  padding: 0 7px; border-radius: 6px; border: 0.5px solid var(--ml-b1);
  background: var(--ml-ov); color: var(--ml-fg2);
  font-family: var(--ml-mono); font-size: 11px; line-height: 22px;
}
.stage-step-btn:hover { color: var(--ml-fg); border-color: var(--ml-brand); }
.stage-step-btn.is-active { color: var(--ml-bg); background: var(--ml-brand); border-color: var(--ml-brand); font-weight: 600; }
.stage-blocks { display: flex; flex-direction: column; gap: 10px; }
.stage-block {
  border: 0.5px solid var(--ml-b1); border-radius: 12px; background: var(--ml-bg);
  padding: 10px 14px 12px; transition: border-color 0.15s ease, box-shadow 0.15s ease;
}
.stage-block.is-current {
  border-color: color-mix(in srgb, var(--ml-brand) 55%, transparent);
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--ml-brand) 13%, transparent);
}
.stage-block-hd { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-bottom: 6px; }
.stage-step-no {
  appearance: none; cursor: pointer; flex: none; min-width: 24px; height: 22px;
  padding: 0 6px; border-radius: 6px; border: 0.5px solid var(--ml-b1);
  background: var(--ml-l1); color: var(--ml-fg2);
  font-family: var(--ml-mono); font-size: 11px; line-height: 20px;
}
.stage-step-no:hover { color: var(--ml-brand); border-color: var(--ml-brand); }
.stage-block.is-current .stage-step-no { color: var(--ml-brand); border-color: color-mix(in srgb, var(--ml-brand) 45%, transparent); background: var(--ml-active); }
.stage-kind { font-size: 10px; letter-spacing: 0.06em; text-transform: uppercase; color: var(--ml-fg2); white-space: nowrap; }
.stage-block-title { font-size: 13px; font-weight: 600; min-width: 0; overflow-wrap: anywhere; }
.stage-block-actions { display: flex; align-items: center; gap: 6px; margin-left: auto; flex-wrap: wrap; }
.stage-caption { font-size: 11.5px; color: var(--ml-fg2); line-height: 1.5; }
.stage-block-bd { font-size: 13.5px; }
.stage-raw { display: flex; flex-direction: column; gap: 8px; }

/* markdown-lite */
.stage-md { line-height: 1.75; overflow-wrap: anywhere; }
.stage-md p { margin: 0 0 6px; }
.stage-md p:last-child { margin-bottom: 0; }
.stage-md ul { margin: 4px 0 8px; padding-left: 20px; }
.stage-md li { margin: 2px 0; }
.stage-md strong { font-weight: 600; }
.stage-md code, .stage-code-inline {
  font-family: var(--ml-mono); font-size: 12px; background: var(--ml-l2);
  border: 0.5px solid var(--ml-b1); border-radius: 4px; padding: 0 4px;
}
.stage-display-math { margin: 8px 0; overflow-x: auto; padding: 4px 0; }

/* headings / prose / math / note */
.stage-h { margin: 2px 0 0; font-weight: 600; line-height: 1.35; overflow-wrap: anywhere; }
.stage-h-1 { font-size: 18px; }
.stage-h-2 { font-size: 15.5px; }
.stage-h-3 { font-size: 13px; color: var(--ml-fg2); letter-spacing: 0.03em; }
.stage-prose { line-height: 1.8; }
.stage-tone-insight { border-left: 3px solid var(--ml-brand); padding-left: 11px; }
.stage-tone-warning { border-left: 3px solid var(--ml-warn); padding-left: 11px; }
.stage-tone-question { border-left: 3px solid var(--ml-idle); padding-left: 11px; color: var(--ml-fg2); }
.stage-math .ml-math-block { font-size: 15px; }
.stage-math-bar { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-top: 4px; }
.stage-note {
  border: 0.5px dashed var(--ml-b2); border-radius: 9px; padding: 8px 11px;
  background: var(--ml-l1); font-size: 12.5px; color: var(--ml-fg2);
}

/* judgment */
.stage-judgment { border-radius: 10px; border: 0.5px solid var(--ml-b1); padding: 10px 12px; background: var(--ml-ov); display: flex; flex-direction: column; gap: 6px; }
.stage-j-brand { border-color: color-mix(in srgb, var(--ml-brand) 32%, transparent); background: color-mix(in srgb, var(--ml-brand) 6%, transparent); }
.stage-j-success { border-color: color-mix(in srgb, var(--ml-ok) 32%, transparent); background: color-mix(in srgb, var(--ml-ok) 6%, transparent); }
.stage-j-warn { border-color: color-mix(in srgb, var(--ml-warn) 34%, transparent); background: color-mix(in srgb, var(--ml-warn) 6%, transparent); }
.stage-j-error { border-color: color-mix(in srgb, var(--ml-err) 34%, transparent); background: color-mix(in srgb, var(--ml-err) 5%, transparent); }
.stage-j-hd { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.stage-j-rule { font-family: var(--ml-mono); font-size: 11.5px; color: var(--ml-fg2); border: 0.5px solid var(--ml-b1); border-radius: 5px; padding: 0 6px; background: var(--ml-l2); }
.stage-j-claim { font-size: 14px; font-weight: 500; line-height: 1.6; }
.stage-j-reason { font-size: 12.5px; color: var(--ml-fg2); line-height: 1.65; }
.stage-chips { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
.stage-chip {
  appearance: none; cursor: pointer; display: inline-flex; align-items: center; gap: 6px;
  border: 0.5px solid var(--ml-b1); background: var(--ml-ov); color: var(--ml-fg2);
  border-radius: 999px; height: 24px; padding: 0 9px; font-size: 11.5px;
}
.stage-chip:hover { color: var(--ml-brand); border-color: color-mix(in srgb, var(--ml-brand) 45%, transparent); }
.stage-chip-glyph { font-family: var(--ml-mono); }
.stage-chip-name { max-width: 180px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

/* strategy tree */
.stage-tree, .stage-tree-children { list-style: none; margin: 0; padding: 0; }
.stage-tree-children { margin-left: 9px; padding-left: 15px; border-left: 1px solid var(--ml-b2); display: flex; flex-direction: column; gap: 3px; }
.stage-tree-node { padding: 2px 0; }
.stage-tree-label { display: flex; align-items: flex-start; gap: 7px; }
.stage-tree-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--ml-idle); flex: none; margin-top: 7px; }
.stage-node-goal .stage-tree-dot { background: var(--ml-brand); }
.stage-node-subgoal .stage-tree-dot { background: color-mix(in srgb, var(--ml-brand) 55%, var(--ml-idle)); }
.stage-node-method .stage-tree-dot { background: var(--ml-warn); }
.stage-node-branch .stage-tree-dot { background: var(--ml-idle); }
.stage-node-result .stage-tree-dot { background: var(--ml-ok); }
.stage-tree-text { font-size: 13px; line-height: 1.55; overflow-wrap: anywhere; }
.stage-tree-sub { font-size: 11.5px; color: var(--ml-fg2); }
.stage-tree-node .ml-collapse { margin: 4px 0 2px 14px; }

/* proof */
.stage-proof { display: flex; flex-direction: column; gap: 8px; }
.stage-proof-hd { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.stage-proof-title { font-size: 13px; font-weight: 600; }
.stage-proof-nav { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.stage-range { accent-color: var(--ml-brand); width: 160px; max-width: 100%; }
.stage-proof-goal { font-size: 12.5px; display: flex; gap: 8px; flex-wrap: wrap; align-items: baseline; }
.stage-proof .ml-fitch { max-height: 460px; }

/* diagrams / plots */
.stage-diagram-block, .stage-plot { display: flex; flex-direction: column; gap: 6px; }
.stage-diagram-scroll { overflow-x: auto; max-width: 100%; padding-bottom: 2px; }
.stage-verify { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; font-size: 12px; }
.stage-verify .ml-list { flex-basis: 100%; }
.stage-plot .ml-plot, .stage-plot svg { max-width: 100%; }

/* compute / symbols / lean */
.stage-compute { display: flex; flex-direction: column; gap: 8px; }
.stage-compute-hd { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.stage-op { font-family: var(--ml-mono); font-size: 11.5px; color: var(--ml-brand); background: var(--ml-l2); border-radius: 5px; padding: 0 5px; }
.stage-sym-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 8px; }
.stage-sym-card { border: 0.5px solid var(--ml-b1); border-radius: 10px; padding: 8px 9px; background: var(--ml-ov); display: flex; flex-direction: column; gap: 3px; min-width: 0; }
.stage-sym-glyph { font-size: 18px; line-height: 1.3; min-height: 24px; display: flex; align-items: center; }
.stage-sym-name { font-size: 12px; overflow-wrap: anywhere; }
.stage-sym-alt { font-size: 11px; color: var(--ml-fg2); overflow-wrap: anywhere; }
.stage-sym-latex { font-family: var(--ml-mono); font-size: 10.5px; color: var(--ml-fg2); overflow-wrap: anywhere; }
.stage-lean { display: flex; flex-direction: column; gap: 8px; }
.stage-lean-hd { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.stage-code { margin: 0; }
.stage-diag-ok { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }

/* takeaway */
.stage-takeaway {
  border: 0.5px solid color-mix(in srgb, var(--ml-brand) 32%, transparent);
  border-radius: 12px; padding: 13px 15px;
  background: color-mix(in srgb, var(--ml-brand) 5%, transparent);
  display: flex; flex-direction: column; gap: 2px;
}
.stage-takeaway-hd { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-bottom: 6px; }
.stage-takeaway-icon { color: var(--ml-brand); font-size: 15px; }
.stage-takeaway-title { margin: 0; font-size: 14px; font-weight: 600; }
.stage-takeaway-row { display: grid; grid-template-columns: 92px minmax(0, 1fr); gap: 8px; padding: 7px 0; border-top: 0.5px dashed var(--ml-b1); }
.stage-takeaway-label { font-size: 11.5px; color: var(--ml-fg2); padding-top: 2px; }
.stage-takeaway-value { font-size: 13px; line-height: 1.65; overflow-wrap: anywhere; }
.stage-takeaway-list { margin: 0; padding-left: 18px; }
.stage-takeaway-list li { margin: 2px 0; }

/* annotations / questions */
.stage-annot { margin-top: 8px; border-top: 0.5px dashed var(--ml-b1); padding-top: 7px; display: flex; flex-direction: column; gap: 5px; }
.stage-annot-item { display: flex; align-items: baseline; gap: 7px; font-size: 12px; color: var(--ml-fg2); flex-wrap: wrap; }
.stage-annot-mark { color: var(--ml-warn); }
.stage-annot-text { color: var(--ml-fg); overflow-wrap: anywhere; }
.stage-annot-time { font-size: 10.5px; color: var(--ml-fg2); margin-left: auto; }
.stage-annot-editor { margin-top: 8px; display: flex; flex-direction: column; gap: 7px; }
.stage-general-notes { border: 0.5px solid var(--ml-b1); border-radius: 12px; padding: 10px 13px; background: var(--ml-l1); display: flex; flex-direction: column; gap: 6px; }
.stage-question { border: 0.5px solid var(--ml-b1); border-radius: 12px; padding: 12px 14px; background: var(--ml-l1); display: flex; flex-direction: column; gap: 8px; }
.stage-question-title { margin: 0; font-size: 13.5px; font-weight: 600; }
.stage-question-list { display: flex; flex-direction: column; gap: 6px; border-top: 0.5px solid var(--ml-b1); padding-top: 8px; }
.stage-q-item { display: flex; align-items: baseline; gap: 8px; flex-wrap: wrap; font-size: 12.5px; }
.stage-q-text { flex: 1 1 240px; min-width: 0; overflow-wrap: anywhere; }
.stage-q-quote { flex: 1 1 100%; font-size: 11.5px; color: var(--ml-fg2); border-left: 2px solid var(--ml-b1); padding-left: 7px; overflow-wrap: anywhere; }
.stage-q-time { font-size: 10.5px; color: var(--ml-fg2); }

/* trace */
.stage-trace { display: flex; flex-direction: column; gap: 8px; }
.stage-trace-toolbar { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.stage-trace-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 7px; }
.stage-trace-item { border: 0.5px solid var(--ml-b1); border-radius: 10px; padding: 8px 11px; background: var(--ml-l1); }
.stage-trace-hd { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; font-size: 12px; }
.stage-trace-op { font-family: var(--ml-mono); font-size: 12px; color: var(--ml-brand); }
.stage-trace-summary { min-width: 0; flex: 1 1 240px; overflow-wrap: anywhere; color: var(--ml-fg); }
.stage-trace-time { font-size: 10.5px; color: var(--ml-fg2); font-family: var(--ml-mono); }
.stage-trace-cols { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 12px; }
.stage-trace-item .ml-collapse { margin-top: 6px; }

/* empty state */
.stage-empty {
  border: 0.5px dashed var(--ml-b2); border-radius: 14px; padding: 30px 24px;
  display: flex; flex-direction: column; align-items: center; gap: 12px; text-align: center;
  background: var(--ml-l1);
}
.stage-empty-mark { font-size: 26px; color: var(--ml-brand); line-height: 1; opacity: 0.85; }
.stage-empty-title { margin: 0; font-size: 16px; font-weight: 600; }
.stage-empty-body { max-width: 560px; font-size: 13px; color: var(--ml-fg2); text-align: left; }
.stage-empty-body .stage-md { text-align: left; }
.stage-empty-ask { font-size: 12.5px; color: var(--ml-fg2); }
.stage-empty-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 6px; width: 100%; max-width: 560px; text-align: left; }
.stage-empty-sample {
  display: block; font-family: var(--ml-mono); font-size: 12px; padding: 7px 10px;
  border: 0.5px solid var(--ml-b1); border-radius: 8px; background: var(--ml-ov);
  color: var(--ml-fg); overflow-wrap: anywhere;
}
.stage-empty-tool { max-width: 560px; font-size: 11.5px; color: var(--ml-fg2); text-align: left; }
.stage-empty .ml-collapse { width: 100%; max-width: 640px; text-align: left; }

@media (max-width: 700px) {
  .stage-hd { padding: 12px 12px; }
  .stage-tools { gap: 6px; }
  .stage-takeaway-row { grid-template-columns: minmax(0, 1fr); gap: 2px; }
  .stage-annot-time { margin-left: 0; }
  .stage-empty { padding: 22px 14px; }
  .stage-proof-hd { gap: 6px; }
  .stage-range { width: 110px; }
}
@media (prefers-reduced-motion: reduce) {
  .stage-pill-live .stage-status-dot, .ml-pill[data-status="starting"] .ml-pill-dot { animation: none; }
  .stage-block { transition: none; }
}
`;

  /* --------------------------------------------------------------- i18n copy */

  ML.assignStrings(
    {
      'tab.stage': '讲解',
      'stage.title': '讲解舞台',
      'stage.untitled': '未命名讲解',
      'stage.status.live': '进行中',
      'stage.status.final': '已完成',
      'stage.status.unknown': '状态未知',
      'stage.rev': 'rev {n}',
      'stage.rev.synced': '已同步',
      'stage.blocks': '{n} 块',
      'stage.step': '第 {i}/{n} 步',
      'stage.prev': '上一步',
      'stage.next': '下一步',
      'stage.follow': '跟随讲解',
      'stage.free': '自由查看',
      'stage.refresh': '刷新',
      'stage.view.label': '讲解视图',
      'stage.view.blocks': '讲解',
      'stage.view.trace': '过程轨迹',
      'stage.export': '导出 Markdown',
      'stage.exporting': '正在导出…',
      'stage.exported': '已导出 Markdown',
      'stage.copyMarkdown': '复制 Markdown',
      'stage.copiedMarkdown': '已复制 Markdown',
      'stage.copyStep': '复制步骤 LaTeX',
      'stage.copiedStep': '已复制本步内容',
      'stage.jumpTo': '跳到第 {n} 步',
      'stage.annotate': '标注',
      'stage.annotate.placeholder': '写下你的疑问或想法… agent 下次会读到',
      'stage.annotate.save': '保存标注',
      'stage.annotate.saved': '已记录标注',
      'stage.annotate.empty': '请先写下内容',
      'stage.annotation': '标注',
      'stage.annotation.general': '整体标注',
      'stage.question.title': '记录问题',
      'stage.question.hint':
        '问题会记录到讲解舞台；点按钮后也会复制到剪贴板，直接粘贴到对话里发给 DeepSeek 即可。',
      'stage.question.placeholder': '例如：为什么要假设 m、n 互素？',
      'stage.question.submit': '记录问题并复制',
      'stage.question.saved': '已记录，复制到对话发送即可',
      'stage.question.copiedOnly': '记录失败，但问题已复制到剪贴板',
      'stage.question.empty': '请先输入问题',
      'stage.question.list': '已记录的问题',
      'stage.question.general': '整体',
      'stage.empty.title': '讲解舞台还没有内容',
      'stage.empty.body':
        '当 DeepSeek 用 MathLab 讲解数学内容时，这块黑板会实时出现结构化的板书：**策略树**、一步步的**判断**、公式、证明、图像与可迁移的**结论**。\n\n你可以在任意一步旁边**标注**疑问，或在底部**记录问题**；agent 下一轮会读到它们，并继续在板上讲解。',
      'stage.empty.ask': '在对话里对 DeepSeek 说：',
      'stage.empty.sample1': '用 MathLab 讲解这道题',
      'stage.empty.sample2': '把 √2 无理性的证明写到讲解舞台，标出每一步判断',
      'stage.empty.sample3': '画出这个函数的图像，并在板上解释单调性',
      'stage.empty.tool':
        '（agent 使用 `mathlab_stage` 工具写板；每次 mathlab / mathlab_plot / mathlab_lean 调用都会自动进入“过程轨迹”。）',
      'stage.trace.title': '过程轨迹',
      'stage.trace.hint': '每次数学工具调用都会自动记录在这里；展开可查看参数与原始结果。',
      'stage.trace.empty': '还没有工具调用记录。',
      'stage.trace.copyAll': '复制全部',
      'stage.trace.copied': '已复制轨迹',
      'stage.trace.count': '{n} 条记录',
      'stage.trace.args': '参数',
      'stage.trace.result': '结果',
      'stage.kind.heading': '标题',
      'stage.kind.prose': '讲解',
      'stage.kind.math': '公式',
      'stage.kind.judgment': '判断',
      'stage.kind.strategy': '策略',
      'stage.kind.proof': '证明',
      'stage.kind.diagram': '图示',
      'stage.kind.plot': '图像',
      'stage.kind.compute': '计算',
      'stage.kind.symbols': '符号',
      'stage.kind.lean': 'Lean',
      'stage.kind.takeaway': '要点',
      'stage.kind.note': '旁注',
      'stage.kind.unknown': '未知块',
      'stage.verdict.goal': '目标',
      'stage.verdict.assume': '假设',
      'stage.verdict.have': '已得',
      'stage.verdict.rule': '规则',
      'stage.verdict.check': '检验',
      'stage.verdict.contradiction': '矛盾',
      'stage.verdict.conclusion': '结论',
      'stage.proof.title': '证明',
      'stage.proof.valid': '有效',
      'stage.proof.invalid': '无效',
      'stage.proof.unknown': '未验证',
      'stage.proof.fitch': 'Fitch 推导',
      'stage.proof.tree': '证明树',
      'stage.proof.rules': '推理规则',
      'stage.proof.line': '第 {i}/{n} 行',
      'stage.proof.empty': '没有可显示的证明行',
      'stage.proof.goal': '目标',
      'stage.strategy.detail': '详情',
      'stage.judgment.symbols': '符号',
      'stage.diagram.title': '图示',
      'stage.diagram.verify': '交换性验证',
      'stage.diagram.verified': '已验证',
      'stage.diagram.invalid': '未通过',
      'stage.diagram.unknown': '图示数据缺失',
      'stage.plot.title': '图像',
      'stage.plot.loading': '正在绘制…',
      'stage.plot.unsupported': '不支持的绘图操作',
      'stage.plot.empty': '没有绘图数据',
      'stage.plot.hint': '滚轮缩放 · 拖拽平移 · 三维视图拖拽旋转',
      'stage.compute.title': '计算',
      'stage.compute.run': '运行计算',
      'stage.compute.running': '计算中…',
      'stage.compute.input': '输入参数',
      'stage.symbols.title': '符号',
      'stage.symbols.loading': '正在加载符号…',
      'stage.symbols.empty': '没有匹配的符号。',
      'stage.symbols.copyLatex': 'LaTeX',
      'stage.lean.title': 'Lean 4',
      'stage.lean.check': '检查',
      'stage.lean.checking': '正在运行 Lean…',
      'stage.lean.ok': '通过',
      'stage.lean.failed': '有错误',
      'stage.lean.diagnostics': '诊断',
      'stage.lean.noDiagnostics': '没有诊断信息。',
      'stage.lean.imports': '导入',
      'stage.lean.stdout': '标准输出',
      'stage.lean.stderr': '标准错误',
      'stage.takeaway.title': '可迁移的结论',
      'stage.takeaway.claim': '主张',
      'stage.takeaway.method': '方法',
      'stage.takeaway.generalization': '推广',
      'stage.takeaway.scope': '适用范围',
      'stage.takeaway.examples': '例子',
      'stage.takeaway.references': '参考',
      'stage.takeaway.copy': '复制要点 Markdown',
      'stage.takeaway.download': '下载 .md',
      'stage.note.title': '旁注',
      'stage.unknown.hint': '该块类型暂不支持渲染，以下为原始数据。',
      'stage.error.title': '讲解舞台加载失败',
      'stage.loading': '正在加载讲解舞台…',
      'stage.offline': '无法连接 Host，面板会自动重试。',
      'stage.retryHint': 'stage.get 没有应答；面板每 ~0.9s 会自动重试一次。',
      'stage.missingStage': '舞台暂无内容（可能已被清空）。',
      'stage.current': '当前步骤',
    },
    {
      'tab.stage': 'Stage',
      'stage.title': 'Live stage',
      'stage.untitled': 'Untitled stage',
      'stage.status.live': 'live',
      'stage.status.final': 'final',
      'stage.status.unknown': 'unknown',
      'stage.rev': 'rev {n}',
      'stage.rev.synced': 'synced',
      'stage.blocks': '{n} blocks',
      'stage.step': 'Step {i}/{n}',
      'stage.prev': 'Prev',
      'stage.next': 'Next',
      'stage.follow': 'Follow',
      'stage.free': 'Browse',
      'stage.refresh': 'Refresh',
      'stage.view.label': 'Stage view',
      'stage.view.blocks': 'Board',
      'stage.view.trace': 'Trace',
      'stage.export': 'Export Markdown',
      'stage.exporting': 'Exporting…',
      'stage.exported': 'Markdown exported',
      'stage.copyMarkdown': 'Copy Markdown',
      'stage.copiedMarkdown': 'Markdown copied',
      'stage.copyStep': 'Copy step LaTeX',
      'stage.copiedStep': 'Step copied',
      'stage.jumpTo': 'Jump to step {n}',
      'stage.annotate': 'Annotate',
      'stage.annotate.placeholder': 'Note your question or idea… the agent reads it next turn',
      'stage.annotate.save': 'Save note',
      'stage.annotate.saved': 'Annotation saved',
      'stage.annotate.empty': 'Write something first',
      'stage.annotation': 'Annotation',
      'stage.annotation.general': 'General annotations',
      'stage.question.title': 'Record a question',
      'stage.question.hint':
        'The question is stored on the stage and copied to your clipboard, so you can paste it into the chat.',
      'stage.question.placeholder': 'e.g. why assume m and n are coprime?',
      'stage.question.submit': 'Record & copy',
      'stage.question.saved': 'Recorded and copied — paste it into the chat',
      'stage.question.copiedOnly': 'Recording failed, but the question was copied',
      'stage.question.empty': 'Type a question first',
      'stage.question.list': 'Recorded questions',
      'stage.question.general': 'general',
      'stage.empty.title': 'The stage is empty',
      'stage.empty.body':
        'When DeepSeek teaches mathematics with MathLab, this blackboard fills in live: a **strategy tree**, one explicit **judgment** per step, formulas, proofs, plots and a generalizable **takeaway**.\n\nYou can **annotate** any step or **record a question** at the bottom; the agent reads them on its next turn and keeps teaching on the board.',
      'stage.empty.ask': 'Say this in the chat:',
      'stage.empty.sample1': 'use MathLab to explain this problem',
      'stage.empty.sample2': 'write the proof that √2 is irrational on the stage, marking each judgment',
      'stage.empty.sample3': 'plot this function and explain monotonicity on the board',
      'stage.empty.tool':
        '(the agent writes with the `mathlab_stage` tool; every mathlab / mathlab_plot / mathlab_lean call is recorded under “Trace”.)',
      'stage.trace.title': 'Trace',
      'stage.trace.hint': 'Every math-tool call is recorded here automatically; expand for args and raw results.',
      'stage.trace.empty': 'No tool calls recorded yet.',
      'stage.trace.copyAll': 'Copy all',
      'stage.trace.copied': 'Trace copied',
      'stage.trace.count': '{n} entries',
      'stage.trace.args': 'Arguments',
      'stage.trace.result': 'Result',
      'stage.kind.heading': 'Heading',
      'stage.kind.prose': 'Narrative',
      'stage.kind.math': 'Formula',
      'stage.kind.judgment': 'Judgment',
      'stage.kind.strategy': 'Strategy',
      'stage.kind.proof': 'Proof',
      'stage.kind.diagram': 'Diagram',
      'stage.kind.plot': 'Plot',
      'stage.kind.compute': 'Computation',
      'stage.kind.symbols': 'Symbols',
      'stage.kind.lean': 'Lean',
      'stage.kind.takeaway': 'Takeaway',
      'stage.kind.note': 'Aside',
      'stage.kind.unknown': 'Unknown block',
      'stage.verdict.goal': 'Goal',
      'stage.verdict.assume': 'Assume',
      'stage.verdict.have': 'Have',
      'stage.verdict.rule': 'Rule',
      'stage.verdict.check': 'Check',
      'stage.verdict.contradiction': 'Contradiction',
      'stage.verdict.conclusion': 'Conclusion',
      'stage.proof.title': 'Proof',
      'stage.proof.valid': 'valid',
      'stage.proof.invalid': 'invalid',
      'stage.proof.unknown': 'unverified',
      'stage.proof.fitch': 'Fitch',
      'stage.proof.tree': 'Tree',
      'stage.proof.rules': 'Rules',
      'stage.proof.line': 'Line {i}/{n}',
      'stage.proof.empty': 'No proof lines to show',
      'stage.proof.goal': 'Goal',
      'stage.strategy.detail': 'Detail',
      'stage.judgment.symbols': 'Symbols',
      'stage.diagram.title': 'Diagram',
      'stage.diagram.verify': 'Commutativity check',
      'stage.diagram.verified': 'verified',
      'stage.diagram.invalid': 'failed',
      'stage.diagram.unknown': 'Missing diagram data',
      'stage.plot.title': 'Plot',
      'stage.plot.loading': 'Plotting…',
      'stage.plot.unsupported': 'Unsupported plot operation',
      'stage.plot.empty': 'No plot data',
      'stage.plot.hint': 'scroll to zoom · drag to pan · drag to rotate 3-D',
      'stage.compute.title': 'Computation',
      'stage.compute.run': 'Run',
      'stage.compute.running': 'Running…',
      'stage.compute.input': 'Arguments',
      'stage.symbols.title': 'Symbols',
      'stage.symbols.loading': 'Loading symbols…',
      'stage.symbols.empty': 'No matching symbols.',
      'stage.symbols.copyLatex': 'LaTeX',
      'stage.lean.title': 'Lean 4',
      'stage.lean.check': 'Check',
      'stage.lean.checking': 'Running Lean…',
      'stage.lean.ok': 'passed',
      'stage.lean.failed': 'errors',
      'stage.lean.diagnostics': 'Diagnostics',
      'stage.lean.noDiagnostics': 'No diagnostics.',
      'stage.lean.imports': 'Imports',
      'stage.lean.stdout': 'stdout',
      'stage.lean.stderr': 'stderr',
      'stage.takeaway.title': 'Generalizable takeaway',
      'stage.takeaway.claim': 'Claim',
      'stage.takeaway.method': 'Method',
      'stage.takeaway.generalization': 'Generalization',
      'stage.takeaway.scope': 'Scope',
      'stage.takeaway.examples': 'Examples',
      'stage.takeaway.references': 'References',
      'stage.takeaway.copy': 'Copy takeaway Markdown',
      'stage.takeaway.download': 'Download .md',
      'stage.note.title': 'Aside',
      'stage.unknown.hint': 'This block kind is not supported; raw data below.',
      'stage.error.title': 'Could not load the stage',
      'stage.loading': 'Loading the stage…',
      'stage.offline': 'Cannot reach the Host; retrying automatically.',
      'stage.retryHint': 'stage.get did not answer; the panel retries about once a second.',
      'stage.missingStage': 'The stage is empty (it may have been cleared).',
      'stage.current': 'current step',
    },
  );

  /* ------------------------------------------------------------------ helpers */

  function tr(t) {
    return typeof t === 'function' ? t : ML.fallbackT();
  }

  function clampIndex(value, length) {
    if (!length || length < 1) return 0;
    const n = Math.round(Number(value));
    if (!Number.isFinite(n)) return 0;
    return ML.clamp(n, 0, length - 1);
  }

  function range2(value) {
    if (!Array.isArray(value) || value.length < 2) return undefined;
    const a = Number(value[0]);
    const b = Number(value[1]);
    if (!Number.isFinite(a) || !Number.isFinite(b) || !(b > a)) return undefined;
    return [a, b];
  }

  function fmtTime(value) {
    if (value === undefined || value === null || value === '') return '';
    try {
      const date = value instanceof Date ? value : new Date(value);
      if (isNaN(date.getTime())) return ML.safeString(value, 40);
      return date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch (error) {
      return ML.safeString(value, 40);
    }
  }

  function slugify(text) {
    const raw = String(text === undefined || text === null ? '' : text).trim();
    const cleaned = raw
      .replace(/[\\/:*?"<>|]+/g, '-')
      .replace(/\s+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 48);
    return cleaned || 'stage';
  }

  function blockIdOf(block, index) {
    if (block && typeof block.id === 'string' && block.id) return block.id;
    return 'b' + (index + 1);
  }

  function blockKindOf(block) {
    return block && typeof block.kind === 'string' && block.kind ? block.kind : 'unknown';
  }

  /** Normalize any tolerated `stage.get` payload into `{stage, revision, trace}`. */
  function normalizeStagePayload(payload) {
    if (!ML.isObj(payload)) return { stage: null, revision: null, trace: [] };
    let stage = null;
    if (ML.isObj(payload.stage)) stage = payload.stage;
    else if (Array.isArray(payload.blocks)) stage = payload;
    let revision = payload.revision;
    if (revision === undefined || revision === null) {
      revision = stage && stage.revision !== undefined && stage.revision !== null ? stage.revision : null;
    }
    const numeric = Number(revision);
    revision = Number.isFinite(numeric) ? numeric : null;
    const stageTrace = ML.toArr(stage && stage.trace);
    return { stage: stage, revision: revision, trace: stageTrace.length ? stageTrace : ML.toArr(payload.trace) };
  }

  /** Fitch lines come either as `block.fitch` or nested under `block.proof.fitch`. */
  function fitchLines(block) {
    if (!ML.isObj(block)) return [];
    const source = ML.isObj(block.proof) ? block.proof : block;
    const direct = ML.toArr(source.fitch);
    if (direct.length > 0) {
      return direct.map(function (line, index) {
        return {
          line: line && line.line !== undefined ? line.line : index + 1,
          indent: ML.clamp(Number(line && line.indent) || 0, 0, 10),
          text: line && line.text !== undefined ? String(line.text) : String((line && line.conclusion) || ''),
          rule: line && line.rule !== undefined ? String(line.rule) : '',
          refs: ML.toArr(line && line.refs),
        };
      });
    }
    const nodes = ML.toArr(source.nodes).length ? ML.toArr(source.nodes) : ML.toArr(block.nodes);
    return nodes.map(function (node, index) {
      const fitch = (node && node.fitch) || {};
      return {
        line: fitch.line !== undefined ? fitch.line : index + 1,
        indent: ML.clamp(Number(fitch.indent) || 0, 0, 10),
        text: fitch.text !== undefined ? String(fitch.text) : String((node && node.conclusion) || ''),
        rule: (node && node.rule) || fitch.rule || '',
        refs: ML.toArr(node && node.premises),
      };
    });
  }

  /** Plain text / LaTeX payload used by "copy step LaTeX". */
  function blockLatex(block) {
    if (!ML.isObj(block)) return '';
    if (typeof block.latex === 'string' && block.latex) return block.latex;
    if (blockKindOf(block) === 'proof') {
      const lines = fitchLines(block);
      if (lines.length) {
        return lines
          .map(function (line) {
            return line.text + (line.rule ? ' \\quad\\text{' + String(line.rule) + '}' : '');
          })
          .join(' \\\\\n');
      }
    }
    if (blockKindOf(block) === 'compute') {
      const expr = ML.pickExpr(block.result);
      const tex = expr ? ML.exprLatex(expr) : '';
      if (tex) return tex;
      if (typeof block.op === 'string' && block.op) {
        return block.op + ' ' + ML.prettyJSON(block.args || {}, 2000);
      }
    }
    if (typeof block.claim === 'string' && block.claim) return block.claim;
    if (typeof block.text === 'string' && block.text) return block.text;
    if (typeof block.title === 'string' && block.title) return block.title;
    return '';
  }

  function takeawayMarkdown(takeaway, title, t) {
    const trFn = tr(t);
    const data = ML.isObj(takeaway) ? takeaway : {};
    const lines = ['## ' + (title || String(trFn('stage.takeaway.title')))];
    const rows = [
      ['claim', 'stage.takeaway.claim'],
      ['method', 'stage.takeaway.method'],
      ['generalization', 'stage.takeaway.generalization'],
      ['scope', 'stage.takeaway.scope'],
    ];
    for (const row of rows) {
      const value = data[row[0]];
      if (value === undefined || value === null || String(value).trim() === '') continue;
      lines.push('', '**' + String(trFn(row[1])) + '**: ' + String(value));
    }
    const examples = ML.toArr(data.examples).map(String).filter(Boolean);
    if (examples.length) {
      lines.push('', '**' + String(trFn('stage.takeaway.examples')) + '**:');
      for (const example of examples) lines.push('- ' + example);
    }
    const references = ML.toArr(data.references).map(String).filter(Boolean);
    if (references.length) {
      lines.push('', '**' + String(trFn('stage.takeaway.references')) + '**:');
      for (const reference of references) lines.push('- ' + reference);
    }
    lines.push('');
    return lines.join('\n');
  }

  /** Client-side Markdown export fallback (also used before the Host op exists). */
  function buildStageMarkdown(stage, t) {
    const trFn = tr(t);
    if (!ML.isObj(stage)) return '';
    const lines = [];
    lines.push('# ' + (typeof stage.title === 'string' && stage.title ? stage.title : String(trFn('stage.untitled'))));
    if (typeof stage.subtitle === 'string' && stage.subtitle) lines.push('', '> ' + stage.subtitle);
    lines.push('');
    for (const block of ML.toArr(stage.blocks)) {
      if (!ML.isObj(block)) continue;
      const kind = blockKindOf(block);
      if (kind === 'heading') {
        const level = ML.clamp(parseInt(block.level, 10) || 2, 1, 3);
        lines.push('', '#'.repeat(level + 1) + ' ' + String(block.text || ''));
      } else if (kind === 'prose' || kind === 'note') {
        lines.push('', String(block.text || ''));
      } else if (kind === 'math') {
        lines.push('', '$$' + String(block.latex || '') + '$$');
        if (block.caption) lines.push('', '_' + String(block.caption) + '_');
      } else if (kind === 'judgment') {
        const verdict = String(block.verdict || 'have');
        lines.push('', '- **' + String(trFn('stage.verdict.' + verdict)) + '**: ' + String(block.claim || ''));
        if (block.rule) lines.push('  - ' + String(trFn('stage.verdict.rule')) + ': ' + String(block.rule));
        if (block.reason) lines.push('  - ' + String(block.reason));
      } else if (kind === 'strategy') {
        lines.push('', '### ' + String(block.title || trFn('stage.kind.strategy')));
        const walk = function (node, depth) {
          if (!ML.isObj(node) || depth > 8) return;
          lines.push('  '.repeat(depth) + '- ' + String(node.label === undefined ? '' : node.label));
          const children = ML.toArr(node.children);
          for (const child of children.slice(0, 40)) walk(child, depth + 1);
        };
        walk(ML.isObj(block.root) ? block.root : null, 0);
      } else if (kind === 'proof') {
        const proofLines = fitchLines(block);
        lines.push('', '### ' + String(block.title || trFn('stage.proof.title')));
        if (block.valid === true) lines.push('', '> ' + String(trFn('stage.proof.valid')));
        lines.push('', '```text');
        for (const line of proofLines) {
          lines.push('  '.repeat(line.indent) + line.text + (line.rule ? '    (' + line.rule + ')' : ''));
        }
        lines.push('```');
      } else if (kind === 'diagram') {
        const diagram = ML.isObj(block.diagram) ? block.diagram : {};
        lines.push('', '### ' + String(block.title || diagram.title || trFn('stage.kind.diagram')));
        lines.push('', '```json', ML.prettyJSON(diagram, 4000), '```');
      } else if (kind === 'plot') {
        lines.push('', '### ' + String(block.title || trFn('stage.plot.title')));
        lines.push('', '```json', ML.prettyJSON({ op: block.op, args: block.args }, 4000), '```');
      } else if (kind === 'compute') {
        lines.push('', '### ' + String(block.title || trFn('stage.compute.title')));
        if (block.op) lines.push('', '`' + String(block.op) + '`');
        const expr = ML.pickExpr(block.result);
        if (expr) {
          const tex = ML.exprLatex(expr);
          if (tex) lines.push('', '$$' + tex + '$$');
        }
      } else if (kind === 'symbols') {
        lines.push('', '### ' + String(block.title || trFn('stage.symbols.title')));
        const ids = ML.toArr(block.ids).map(String);
        if (ids.length) lines.push('', ids.join(', '));
      } else if (kind === 'lean') {
        lines.push('', '### ' + String(block.title || trFn('stage.kind.lean')));
        const imports = ML.toArr(block.imports).map(String).filter(Boolean);
        lines.push('', '```lean');
        if (imports.length) lines.push(imports.join('\n'), '');
        lines.push(String(block.code || ''), '```');
      } else if (kind === 'takeaway') {
        const markdown = takeawayMarkdown(block, block.title, t);
        lines.push('', markdown);
      }
    }
    if (ML.isObj(stage.takeaway)) {
      const hasTakeawayBlock = ML.toArr(stage.blocks).some(function (block) {
        return ML.isObj(block) && blockKindOf(block) === 'takeaway';
      });
      if (!hasTakeawayBlock) lines.push('', takeawayMarkdown(stage.takeaway, null, t));
    }
    lines.push('');
    return lines.join('\n');
  }

  /* ------------------------------------------------------- symbols (shared) */

  const symbolsStore = { data: null, promise: null };

  function loadSymbolsData() {
    if (symbolsStore.data) return Promise.resolve(symbolsStore.data);
    if (!symbolsStore.promise) {
      symbolsStore.promise = ML.callMath('symbols.list', {})
        .then(function (data) {
          symbolsStore.data = ML.isObj(data) ? data : { fields: [], symbols: [] };
          return symbolsStore.data;
        })
        .catch(function (error) {
          symbolsStore.promise = null;
          throw error;
        });
    }
    return symbolsStore.promise;
  }

  function symbolIndex(data) {
    const index = new Map();
    for (const symbol of ML.toArr(data && data.symbols)) {
      if (!ML.isObj(symbol)) continue;
      const keys = [symbol.id, symbol.symbol, symbol.latex, symbol.unicode, symbol.name, symbol.name_zh];
      for (const key of keys) {
        if (typeof key !== 'string' || !key) continue;
        if (!index.has(key)) index.set(key, symbol);
        const lower = key.toLowerCase();
        if (!index.has(lower)) index.set(lower, symbol);
      }
    }
    return index;
  }

  function symbolLookup(index, id) {
    if (!index) return null;
    return index.get(id) || index.get(String(id).toLowerCase()) || null;
  }

  function symbolName(symbol, t) {
    const lang = ML.lang(tr(t));
    return ML.pick(lang, symbol.name_zh, symbol.name) || symbol.id || '';
  }

  /* ------------------------------------------------------- markdown-lite */

  function inlineNodes(text, keyPrefix) {
    const source = String(text === undefined || text === null ? '' : text);
    const parts = [];
    const re = /(\*\*[^*\n]+\*\*|`[^`\n]+`|\$[^$\n]+\$)/g;
    let last = 0;
    let match;
    let index = 0;
    while ((match = re.exec(source)) !== null) {
      if (match.index > last) parts.push(source.slice(last, match.index));
      index += 1;
      const token = match[1];
      const key = keyPrefix + '-i' + index;
      if (token.slice(0, 2) === '**') parts.push(h('strong', { key: key }, token.slice(2, -2)));
      else if (token.slice(0, 1) === '`') parts.push(h('code', { key: key }, token.slice(1, -1)));
      else parts.push(h(ML.Math, { key: key, tex: token.slice(1, -1) }));
      last = match.index + token.length;
    }
    if (last < source.length) parts.push(source.slice(last));
    return parts;
  }

  /** Safe markdown-lite renderer: paragraphs, `- ` lists, **bold**, `code`, $x$ / $$x$$. */
  function MarkdownLite(props) {
    const source =
      typeof props.text === 'string' ? props.text : ML.safeString(props.text === undefined ? '' : props.text, 8000);
    const className = 'stage-md' + (props.className ? ' ' + props.className : '');
    if (!source) return h('div', { className: className });
    const lines = source.replace(/\r\n?/g, '\n').split('\n');
    const nodes = [];
    let key = 0;
    let paragraph = [];
    let listItems = [];
    let displayTex = null;

    const flushParagraph = function () {
      if (!paragraph.length) return;
      const content = [];
      paragraph.forEach(function (line, index) {
        if (index > 0) content.push(h('br', { key: 'br' + key + '-' + index }));
        const spans = inlineNodes(line, 'p' + key + '-' + index);
        for (const span of spans) content.push(span);
      });
      key += 1;
      nodes.push(h('p', { key: 'p' + key }, content));
      paragraph = [];
    };
    const flushList = function () {
      if (!listItems.length) return;
      key += 1;
      nodes.push(
        h(
          'ul',
          { key: 'ul' + key },
          listItems.map(function (itemNodes, index) {
            return h('li', { key: 'li' + index }, itemNodes);
          }),
        ),
      );
      listItems = [];
    };
    const flushAll = function () {
      flushParagraph();
      flushList();
    };

    let i = 0;
    while (i < lines.length) {
      const rawLine = lines[i];
      const line = rawLine.trim();
      if (displayTex !== null) {
        if (line.slice(-2) === '$$') {
          displayTex += (displayTex ? '\n' : '') + line.slice(0, -2);
          flushAll();
          key += 1;
          nodes.push(
            h(
              'div',
              { key: 'dm' + key, className: 'stage-display-math' },
              h(ML.Math, { tex: displayTex.trim(), display: true }),
            ),
          );
          displayTex = null;
        } else {
          displayTex += (displayTex ? '\n' : '') + rawLine;
        }
        i += 1;
        continue;
      }
      if (!line) {
        flushAll();
        i += 1;
        continue;
      }
      if (line.slice(0, 2) === '$$') {
        flushAll();
        const rest = line.slice(2);
        if (rest.length >= 2 && rest.slice(-2) === '$$') {
          key += 1;
          nodes.push(
            h(
              'div',
              { key: 'dm' + key, className: 'stage-display-math' },
              h(ML.Math, { tex: rest.slice(0, -2).trim(), display: true }),
            ),
          );
        } else {
          displayTex = rest;
        }
        i += 1;
        continue;
      }
      if (line.slice(0, 2) === '- ' || line.slice(0, 2) === '* ' || line === '-') {
        flushParagraph();
        const itemText = line.length > 2 ? line.slice(2) : '';
        listItems.push(inlineNodes(itemText, 'l' + key + '-' + listItems.length));
        i += 1;
        continue;
      }
      flushList();
      paragraph.push(line);
      i += 1;
    }
    flushAll();
    if (displayTex !== null) {
      key += 1;
      nodes.push(h('p', { key: 'dm-raw' + key }, displayTex));
    }
    return h('div', { className: className }, nodes);
  }

  /* ------------------------------------------------ small shared components */

  function RawBlock(props) {
    const t = tr(props.t);
    return h(
      'div',
      { className: 'stage-raw' },
      h(ML.Banner, { tone: 'warn' }, props.label || String(t('stage.unknown.hint'))),
      h(ML.RawJSON, { value: props.block }),
    );
  }

  function BlockTitle(props) {
    return props.title ? h('div', { className: 'stage-block-title' }, String(props.title)) : null;
  }

  function SymbolChips(props) {
    const t = tr(props.t);
    const ids = ML.toArr(props.ids)
      .map(String)
      .filter(Boolean);
    const [index, setIndex] = useState(null);
    useEffect(function () {
      let alive = true;
      if (!ids.length) return undefined;
      loadSymbolsData()
        .then(function (data) {
          if (alive) setIndex(symbolIndex(data));
        })
        .catch(function () {
          /* chips still render as plain ids */
        });
      return function () {
        alive = false;
      };
    }, []);
    if (!ids.length) return null;
    return h(
      'div',
      { className: 'stage-chips' },
      props.label ? h('span', { className: 'stage-caption' }, String(props.label)) : null,
      ids.map(function (id, index_) {
        const symbol = symbolLookup(index, id);
        const latex = symbol && typeof symbol.latex === 'string' ? symbol.latex : '';
        const glyph = symbol ? String(symbol.unicode || symbol.symbol || id) : id;
        const name = symbol ? symbolName(symbol, t) : id;
        const isActive = props.activeSymbol === id;
        return h(
          'button',
          {
            key: index_ + ':' + id,
            type: 'button',
            className: 'stage-chip' + (isActive ? ' is-active' : ''),
            title:
              name +
              (latex ? ' · ' + latex : '') +
              ' · ' +
              String(t(props.onSymbolClick ? 'stage.symbol.focusHint' : 'common.copy')),
            onClick: function () {
              if (typeof props.onSymbolClick === 'function') props.onSymbolClick(isActive ? null : id);
              else ML.copy(latex || glyph);
            },
            onDoubleClick: function () {
              ML.copy(latex || glyph);
            },
          },
          latex ? h(ML.Math, { tex: latex }) : h('span', { className: 'stage-chip-glyph' }, glyph),
          h('span', { className: 'stage-chip-name' }, name),
        );
      }),
    );
  }

  /* -------------------------------------------------------- block renderers */

  function HeadingBlock(props) {
    const level = ML.clamp(parseInt(props.block && props.block.level, 10) || 2, 1, 3);
    const text = props.block && props.block.text !== undefined ? String(props.block.text) : '';
    return h('h' + (level + 1), { className: 'stage-h stage-h-' + level }, text);
  }

  function ProseBlock(props) {
    const block = props.block || {};
    const tone = ['insight', 'warning', 'question'].indexOf(String(block.tone || '')) >= 0 ? String(block.tone) : '';
    return h(
      'div',
      { className: 'stage-prose' + (tone ? ' stage-tone-' + tone : '') },
      h(MarkdownLite, { text: block.text === undefined ? '' : block.text }),
    );
  }

  function MathBlock(props) {
    const t = tr(props.t);
    const block = props.block || {};
    const tex = typeof block.latex === 'string' ? block.latex : '';
    if (!tex) return h(RawBlock, { block: block, t: t });
    return h(
      'div',
      { className: 'stage-math' },
      h(ML.FormulaBlock, { tex: tex, label: block.caption ? String(block.caption) : undefined }),
      h('div', { className: 'stage-math-bar' }, h(ML.CopyBtn, { text: tex, label: t('common.copyLatex'), size: 'sm' })),
    );
  }

  function JudgmentBlock(props) {
    const t = tr(props.t);
    const block = props.block || {};
    const verdict = typeof block.verdict === 'string' && block.verdict ? block.verdict : 'have';
    const tone = VERDICT_TONES[verdict] || 'idle';
    const verdictKey = 'stage.verdict.' + verdict;
    const label = String(t(verdictKey)) === verdictKey ? verdict : String(t(verdictKey));
    const symbols = ML.toArr(block.symbols)
      .map(String)
      .filter(Boolean);
    return h(
      'div',
      { className: 'stage-judgment stage-j-' + tone },
      h(
        'div',
        { className: 'stage-j-hd' },
        h(ML.Badge, { tone: tone }, label),
        block.rule
          ? h('span', { className: 'stage-j-rule' }, String(t('stage.verdict.rule')) + ' · ' + String(block.rule))
          : null,
      ),
      block.claim ? h('div', { className: 'stage-j-claim' }, h(MarkdownLite, { text: block.claim })) : null,
      block.reason ? h('div', { className: 'stage-j-reason' }, h(MarkdownLite, { text: block.reason })) : null,
      symbols.length
        ? h(SymbolChips, {
            ids: symbols,
            t: t,
            label: t('stage.judgment.symbols'),
            activeSymbol: props.activeSymbol,
            onSymbolClick: props.onSymbolClick,
          })
        : null,
    );
  }

  function StrategyNode(props) {
    const node = props.node;
    if (!ML.isObj(node)) {
      return h('li', { className: 'stage-tree-node' }, h('span', { className: 'stage-tree-text' }, ML.safeString(node, 300)));
    }
    const kind = String(node.kind || 'subgoal');
    const children = props.depth >= 8 ? [] : ML.toArr(node.children).slice(0, 40);
    const detail = node.detail !== undefined && node.detail !== null ? String(node.detail) : '';
    return h(
      'li',
      { className: 'stage-tree-node stage-node-' + kind },
      h(
        'div',
        { className: 'stage-tree-label' },
        h('span', { className: 'stage-tree-dot', 'aria-hidden': true }),
        h('span', { className: 'stage-tree-text' }, node.label === undefined || node.label === null ? '·' : String(node.label)),
      ),
      detail
        ? h(
            ML.Collapse,
            { title: props.t('stage.strategy.detail'), summary: detail.slice(0, 80) },
            h(MarkdownLite, { text: detail }),
          )
        : null,
      children.length
        ? h(
            'ul',
            { className: 'stage-tree-children' },
            children.map(function (child, index) {
              return h(StrategyNode, {
                key: index,
                node: child,
                depth: props.depth + 1,
                t: props.t,
              });
            }),
          )
        : null,
    );
  }

  function StrategyBlock(props) {
    const t = tr(props.t);
    const block = props.block || {};
    const root = ML.isObj(block.root) ? block.root : null;
    if (!root) return h(RawBlock, { block: block, t: t });
    return h(
      'div',
      { className: 'stage-strategy' },
      h(BlockTitle, { title: block.title }),
      h('ul', { className: 'stage-tree' }, h(StrategyNode, { node: root, depth: 0, t: t })),
    );
  }

  function ProofBlock(props) {
    const t = tr(props.t);
    const block = props.block || {};
    const lines = fitchLines(block);
    const nodes = ML.toArr(block.nodes);
    const [visible, setVisible] = useState(lines.length);
    const [treeMode, setTreeMode] = useState(false);
    useEffect(
      function () {
        setVisible(lines.length);
      },
      [lines.length],
    );
    const total = lines.length;
    const shown = ML.clamp(visible, 0, total);
    const valid = block.valid;
    const canTree = nodes.length > 0;
    const useTree = canTree && treeMode;
    const title = block.title ? String(block.title) : String(t('stage.proof.title'));
    const goal = block.goal !== undefined && block.goal !== null ? ML.safeString(block.goal, 800) : '';
    return h(
      'div',
      { className: 'stage-proof' },
      h(
        'div',
        { className: 'stage-proof-hd' },
        h('span', { className: 'stage-proof-title' }, title),
        valid === true
          ? h(ML.Badge, { tone: 'success' }, t('stage.proof.valid'))
          : valid === false
            ? h(ML.Badge, { tone: 'error' }, t('stage.proof.invalid'))
            : h(ML.Badge, { tone: 'idle' }, t('stage.proof.unknown')),
        canTree
          ? h(
              'div',
              { className: 'ml-tabs ml-tabs-sm' },
              h(
                'button',
                {
                  type: 'button',
                  className: 'ml-tab' + (useTree ? '' : ' is-active'),
                  'aria-pressed': !useTree,
                  onClick: function () {
                    setTreeMode(false);
                  },
                },
                t('stage.proof.fitch'),
              ),
              h(
                'button',
                {
                  type: 'button',
                  className: 'ml-tab' + (useTree ? ' is-active' : ''),
                  'aria-pressed': useTree,
                  onClick: function () {
                    setTreeMode(true);
                  },
                },
                t('stage.proof.tree'),
              ),
            )
          : null,
      ),
      goal
        ? h(
            'div',
            { className: 'stage-proof-goal' },
            h('span', { className: 'stage-caption' }, t('stage.proof.goal')),
            h(MarkdownLite, { text: goal }),
          )
        : null,
      useTree
        ? h(ML.ProofTree, { nodes: nodes })
        : h(
            'div',
            null,
            h(
              'div',
              { className: 'stage-proof-nav' },
              h(
                ML.Btn,
                {
                  size: 'sm',
                  onClick: function () {
                    setVisible(Math.max(0, shown - 1));
                  },
                  disabled: shown <= 0,
                  'aria-label': t('stage.prev'),
                },
                '‹ ' + t('stage.prev'),
              ),
              h('input', {
                type: 'range',
                className: 'stage-range',
                min: 0,
                max: total,
                value: shown,
                'aria-label': ML.fmt(t, 'stage.proof.line', { i: shown, n: total }),
                onChange: function (event) {
                  setVisible(ML.clamp(parseInt(event.target.value, 10) || 0, 0, total));
                },
              }),
              h(
                ML.Btn,
                {
                  size: 'sm',
                  onClick: function () {
                    setVisible(Math.min(total, shown + 1));
                  },
                  disabled: shown >= total,
                  'aria-label': t('stage.next'),
                },
                t('stage.next') + ' ›',
              ),
              h('span', { className: 'stage-caption' }, ML.fmt(t, 'stage.proof.line', { i: shown, n: total })),
            ),
            total === 0
              ? h(ML.Empty, { label: t('stage.proof.empty') })
              : shown === 0
                ? h(ML.Empty, { label: t('stage.proof.empty') })
                : h(ML.FitchProof, { proof: { fitch: lines.slice(0, shown) } }),
          ),
      h(ML.Collapse, { title: t('stage.proof.rules') }, h(ML.RuleLegend)),
    );
  }

  function DiagramBlock(props) {
    const t = tr(props.t);
    const block = props.block || {};
    const diagram = ML.isObj(block.diagram) ? block.diagram : null;
    if (!diagram) return h(RawBlock, { block: block, t: t });
    const kind = String(diagram.kind || '');
    const title = diagram.title || block.title || '';
    let body = null;
    if (kind === 'category' || (ML.isObj(diagram.category) && kind !== 'hasse' && kind !== 'cayley')) {
      const category = ML.isObj(diagram.category) ? diagram.category : null;
      body = category
        ? h(ML.CommutativeDiagram, { category: category, ariaLabel: title || String(t('stage.diagram.title')) })
        : h(ML.Empty, { label: t('stage.diagram.unknown') });
    } else if (kind === 'hasse') {
      body = h(ML.HasseDiagram, { nodes: ML.toArr(diagram.nodes), edges: ML.toArr(diagram.edges) });
    } else if (kind === 'cayley') {
      body = h(ML.CayleyTable, { elements: ML.toArr(diagram.elements), table: ML.toArr(diagram.table) });
    } else if (kind === 'strategy-graph') {
      const root = ML.isObj(diagram.root) ? diagram.root : ML.isObj(block.root) ? block.root : null;
      body = root
        ? h('ul', { className: 'stage-tree' }, h(StrategyNode, { node: root, depth: 0, t: t }))
        : h(ML.Empty, { label: t('stage.diagram.unknown') });
    } else {
      body = h(RawBlock, { block: diagram, t: t, label: t('stage.diagram.unknown') });
    }
    const verify = ML.isObj(diagram.verify) ? diagram.verify : ML.isObj(block.verify) ? block.verify : null;
    let verifyNode = null;
    if (verify) {
      const valid = verify.valid !== undefined ? verify.valid : verify.commutes;
      const violations = ML.toArr(verify.violations);
      verifyNode = h(
        'div',
        { className: 'stage-verify' },
        h('span', { className: 'stage-caption' }, t('stage.diagram.verify')),
        valid === true
          ? h(ML.Badge, { tone: 'success' }, t('stage.diagram.verified'))
          : valid === false
            ? h(ML.Badge, { tone: 'error' }, t('stage.diagram.invalid'))
            : h(ML.Badge, { tone: 'idle' }, t('stage.diagram.unknown')),
        verify.message ? h('span', { className: 'stage-caption' }, ML.safeString(verify.message, 400)) : null,
        violations.length
          ? h(
              'ul',
              { className: 'ml-list' },
              violations.map(function (item, index) {
                return h(
                  'li',
                  { key: index },
                  ML.isObj(item) ? ML.safeString(item.message || item.reason || item, 400) : String(item),
                );
              }),
            )
          : null,
      );
    }
    return h(
      'div',
      { className: 'stage-diagram-block' },
      h(BlockTitle, { title: title }),
      h('div', { className: 'stage-diagram-scroll' }, body),
      verifyNode,
      block.caption ? h('div', { className: 'stage-caption' }, String(block.caption)) : null,
    );
  }

  const PLOT_OPS = [
    'plot.sample',
    'plot.sample_multi',
    'plot.parametric',
    'plot.polar',
    'plot.implicit',
    'plot.surface3d',
    'plot.field',
  ];

  function plotCurveSegments(curves) {
    const segments = [];
    ML.toArr(curves).forEach(function (curve, curveIndex) {
      const raw = curve && curve.points !== undefined ? curve.points : curve;
      if (!Array.isArray(raw) || raw.length === 0) return;
      const first = raw[0];
      const isPolyline = Array.isArray(first) && first.length >= 1 && typeof first[0] === 'number';
      const polylines = isPolyline ? [raw] : raw;
      polylines.forEach(function (points) {
        const clean = ML.toArr(points).filter(function (point) {
          return (
            Array.isArray(point) &&
            point.length >= 2 &&
            Number.isFinite(Number(point[0])) &&
            Number.isFinite(Number(point[1]))
          );
        });
        if (!clean.length) return;
        segments.push({
          points: clean.map(function (point) {
            return [Number(point[0]), Number(point[1])];
          }),
          label: curve && curve.expr !== undefined ? String(curve.expr) : undefined,
          colorIndex: curveIndex,
        });
      });
    });
    return segments;
  }

  function normalizePlotView(op, args, data) {
    const kind = String(op || '').replace(/^plot\./, '');
    const params = ML.isObj(args) ? args : {};
    if (kind === 'surface3d') {
      return {
        kind: 'surface3d',
        vertices: ML.toArr(data && data.vertices).filter(function (vertex) {
          return Array.isArray(vertex) && vertex.length >= 3;
        }),
        indices: ML.toArr(data && data.indices),
      };
    }
    if (kind === 'sample' || kind === 'sample_multi') {
      return {
        kind: '2d',
        segments: plotCurveSegments(data && data.curves),
        xRange: range2(data && data.range) || range2(params.range),
        yRange: range2(data && data.yRange) || range2(params.yRange),
      };
    }
    if (kind === 'implicit') {
      const segments = ML.toArr(data && data.segments).map(function (segment, index) {
        return {
          points: ML.toArr(segment)
            .filter(function (point) {
              return Array.isArray(point) && point.length >= 2;
            })
            .map(function (point) {
              return [Number(point[0]), Number(point[1])];
            }),
          colorIndex: index,
        };
      });
      return {
        kind: '2d',
        segments: segments.filter(function (segment) {
          return segment.points.length > 0;
        }),
        xRange: range2(params.xRange),
        yRange: range2(params.yRange),
      };
    }
    if (kind === 'parametric' || kind === 'polar') {
      const points = ML.toArr(data && data.points)
        .filter(function (point) {
          return (
            Array.isArray(point) &&
            point.length >= 2 &&
            Number.isFinite(Number(point[0])) &&
            Number.isFinite(Number(point[1]))
          );
        })
        .map(function (point) {
          return [Number(point[0]), Number(point[1])];
        });
      return {
        kind: '2d',
        segments: points.length ? [{ points: points, label: kind === 'polar' ? 'r(θ)' : 'x(t), y(t)', colorIndex: 0 }] : [],
      };
    }
    if (kind === 'field') {
      return {
        kind: '2d',
        arrows: ML.toArr(data && data.arrows).filter(function (arrow) {
          return Array.isArray(arrow) && arrow.length >= 4;
        }),
        xRange: range2(params.xRange),
        yRange: range2(params.yRange),
      };
    }
    if (data && Array.isArray(data.curves)) return normalizePlotView('plot.sample_multi', params, data);
    if (data && Array.isArray(data.points)) return normalizePlotView('plot.parametric', params, data);
    return null;
  }

  function PlotBlock(props) {
    const t = tr(props.t);
    const block = props.block || {};
    const op = typeof block.op === 'string' ? block.op : '';
    const args = ML.isObj(block.args) ? block.args : {};
    const argsKey = useMemo(
      function () {
        return ML.prettyJSON(args, 4000);
      },
      [block.args],
    );
    const [state, setState] = useState({ status: 'idle', data: null, error: null });
    const aliveRef = useRef(true);
    useEffect(function () {
      aliveRef.current = true;
      return function () {
        aliveRef.current = false;
      };
    }, []);
    const run = useCallback(
      function () {
        if (PLOT_OPS.indexOf(op) < 0) return;
        setState({ status: 'loading', data: null, error: null });
        ML.callMath(op, args)
          .then(function (data) {
            if (aliveRef.current) setState({ status: 'ready', data: data, error: null });
          })
          .catch(function (error) {
            if (aliveRef.current) setState({ status: 'error', data: null, error: error });
          });
      },
      [op, argsKey],
    );
    useEffect(
      function () {
        run();
      },
      [run],
    );

    const title = block.title ? String(block.title) : String(t('stage.plot.title'));
    let body;
    if (PLOT_OPS.indexOf(op) < 0) {
      body = h(ML.Banner, { tone: 'warn' }, t('stage.plot.unsupported') + (op ? ' · ' + op : ''));
    } else if (state.status === 'loading') {
      body = h(ML.Loading, { label: t('stage.plot.loading') });
    } else if (state.status === 'error') {
      body = h(ML.ErrorBox, { error: state.error, onRetry: run });
    } else if (state.status === 'ready') {
      const view = normalizePlotView(op, args, state.data);
      if (!view) {
        body = h(RawBlock, { block: state.data, t: t, label: t('stage.plot.empty') });
      } else if (view.kind === 'surface3d') {
        body = view.vertices.length
          ? h(ML.Surface3D, {
              vertices: view.vertices,
              indices: view.indices,
              title: title,
              filename: 'stage-surface.svg',
            })
          : h(ML.Empty, { label: t('stage.plot.empty') });
      } else {
        body = h(ML.Plot2D, {
          segments: view.segments || [],
          arrows: view.arrows || [],
          xRange: view.xRange,
          yRange: view.yRange,
          xLabel: 'x',
          yLabel: 'y',
          resetKey: op + ':' + argsKey.slice(0, 120),
          filename: 'stage-plot.svg',
          hint: t('stage.plot.hint'),
        });
      }
    } else {
      body = h(ML.Empty, { label: t('stage.plot.empty') });
    }
    return h(
      'div',
      { className: 'stage-plot' },
      h(BlockTitle, { title: title }),
      body,
      block.caption ? h('div', { className: 'stage-caption' }, String(block.caption)) : null,
    );
  }

  function ComputeResult(props) {
    const data = props.data;
    if (data === undefined || data === null) return h(ML.Empty, { label: String(tr(props.t)('common.noResult')) });
    if (ML.pickExpr(data)) return h(ML.ExprResult, { data: data });
    return h(ML.DataView, { data: data });
  }

  function ComputeBlock(props) {
    const t = tr(props.t);
    const block = props.block || {};
    const op = typeof block.op === 'string' ? block.op : '';
    const args = ML.isObj(block.args) ? block.args : {};
    const argsKey = useMemo(
      function () {
        return ML.prettyJSON(args, 4000);
      },
      [block.args],
    );
    const embedded = block.result !== undefined && block.result !== null ? block.result : null;
    const embeddedKey = useMemo(
      function () {
        return embedded === null ? '' : ML.prettyJSON(embedded, 8000);
      },
      [block.result],
    );
    const [state, setState] = useState({ status: embedded !== null ? 'ready' : 'idle', data: embedded, error: null });
    const aliveRef = useRef(true);
    useEffect(function () {
      aliveRef.current = true;
      return function () {
        aliveRef.current = false;
      };
    }, []);
    const run = useCallback(
      function () {
        if (!op) return;
        setState({ status: 'loading', data: null, error: null });
        ML.callMath(op, args)
          .then(function (data) {
            if (aliveRef.current) setState({ status: 'ready', data: data, error: null });
          })
          .catch(function (error) {
            if (aliveRef.current) setState({ status: 'error', data: null, error: error });
          });
      },
      [op, argsKey],
    );
    useEffect(
      function () {
        if (embeddedKey) {
          setState(function (previous) {
            return { status: 'ready', data: embedded, error: null };
          });
          return;
        }
        run();
      },
      [embeddedKey, run],
    );
    const title = block.title ? String(block.title) : String(t('stage.compute.title'));
    let body;
    if (state.status === 'loading') body = h(ML.Loading, { label: t('stage.compute.running') });
    else if (state.status === 'error') body = h(ML.ErrorBox, { error: state.error, onRetry: run });
    else if (state.data === undefined || state.data === null) body = h(ML.Empty, { label: t('common.noResult') });
    else body = h(ComputeResult, { data: state.data, t: t });
    return h(
      'div',
      { className: 'stage-compute' },
      h(
        'div',
        { className: 'stage-compute-hd' },
        h('span', { className: 'stage-block-title' }, title),
        op ? h('code', { className: 'stage-op' }, op) : null,
        h('span', { className: 'stage-spacer' }),
        h(
          ML.Btn,
          { size: 'sm', onClick: run, disabled: !op || state.status === 'loading' },
          state.status === 'loading' ? t('stage.compute.running') : t('stage.compute.run'),
        ),
      ),
      body,
      block.caption ? h('div', { className: 'stage-caption' }, String(block.caption)) : null,
      Object.keys(args).length
        ? h(ML.Collapse, { title: t('stage.compute.input') }, h(ML.RawJSON, { value: args }))
        : null,
    );
  }

  /* Bipartite symbol → step graph: a compact visual index of which judgments cite each symbol. */
  function SymbolGraph(props) {
    const rows = ML.toArr(props.rows)
      .filter(function (row) {
        return ML.isObj(row) && ML.toArr(row.steps).length > 0;
      })
      .slice(0, 8);
    if (rows.length === 0) return null;
    const steps = [];
    for (const row of rows) {
      for (const step of row.steps) if (steps.indexOf(step) < 0) steps.push(step);
    }
    steps.sort(function (a, b) {
      return a - b;
    });
    const height = Math.max(72, rows.length * 30 + 18, steps.length * 20 + 18);
    const width = 260;
    const leftX = 8;
    const rightX = width - 8;
    const rowY = function (index) {
      return 14 + index * ((height - 26) / Math.max(1, rows.length - 1));
    };
    const stepY = function (index) {
      return 14 + index * ((height - 26) / Math.max(1, steps.length - 1));
    };
    const stepPos = new Map(
      steps.map(function (step, index) {
        return [step, stepY(index)];
      }),
    );
    return h(
      'div',
      { className: 'stage-sym-graph' },
      h('div', { className: 'stage-caption' }, String(props.label || '')),
      h(
        'svg',
        { viewBox: '0 0 ' + width + ' ' + height, role: 'img', style: { width: '100%', height: height + 'px' } },
        rows.map(function (row, rowIndex) {
          const y = rowY(rowIndex);
          const glyph = String(row.symbol && (row.symbol.unicode || row.symbol.symbol) ? row.symbol.unicode || row.symbol.symbol : row.id).slice(0, 14);
          const active = props.activeSymbol === row.id;
          return h(
            'g',
            { key: 'sym-' + row.id },
            ML.toArr(row.steps).map(function (step) {
              return h('line', {
                key: 'line-' + step,
                x1: leftX + 78,
                y1: y,
                x2: rightX - 30,
                y2: stepPos.get(step),
                className: 'stage-sym-graph-line' + (active ? ' is-active' : ''),
              });
            }),
            h('circle', {
              cx: leftX + 78,
              cy: y,
              r: 3,
              className: 'stage-sym-graph-dot' + (active ? ' is-active' : ''),
            }),
            h(
              'text',
              {
                x: leftX,
                y: y + 4,
                className: 'stage-sym-graph-label' + (active ? ' is-active' : ''),
                onClick: function () {
                  if (typeof props.onSymbolClick === 'function') props.onSymbolClick(active ? null : row.id);
                },
              },
              glyph,
            ),
          );
        }),
        steps.map(function (step) {
          return h(
            'g',
            { key: 'step-' + step },
            h('circle', { cx: rightX - 30, cy: stepPos.get(step), r: 2.5, className: 'stage-sym-graph-dot' }),
            h(
              'text',
              {
                x: rightX,
                y: stepPos.get(step) + 4,
                textAnchor: 'end',
                className: 'stage-sym-graph-step',
                onClick: function () {
                  if (typeof props.jumpTo === 'function') props.jumpTo(step);
                },
              },
              '第 ' + (step + 1) + ' 步',
            ),
          );
        }),
      ),
    );
  }

  function SymbolsBlock(props) {
    const t = tr(props.t);
    const block = props.block || {};
    const [state, setState] = useState({ loading: true, error: null, data: null });
    const load = useCallback(function () {
      setState({ loading: true, error: null, data: null });
      loadSymbolsData()
        .then(function (data) {
          setState({ loading: false, error: null, data: data });
        })
        .catch(function (error) {
          setState({ loading: false, error: error, data: null });
        });
    }, []);
    useEffect(
      function () {
        load();
      },
      [load],
    );
    const data = state.data;
    const ids = ML.toArr(block.ids)
      .map(String)
      .filter(Boolean);
    const query = typeof block.query === 'string' ? block.query.trim().toLowerCase() : '';
    const field = typeof block.field === 'string' ? block.field : '';
    let list;
    if (ids.length) {
      const index = symbolIndex(data || {});
      list = ids.map(function (id) {
        return symbolLookup(index, id) || { id: id, name: id, name_zh: id, symbol: id, unicode: id };
      });
    } else {
      list = ML.toArr(data && data.symbols).filter(function (symbol) {
        if (!ML.isObj(symbol)) return false;
        if (field && String(symbol.field || '') !== field) return false;
        if (!query) return true;
        const haystack = [
          symbol.symbol,
          symbol.unicode,
          symbol.latex,
          symbol.name,
          symbol.name_zh,
          symbol.description,
          symbol.description_zh,
          ML.toArr(symbol.tags).join(' '),
        ]
          .join(' ')
          .toLowerCase();
        return haystack.indexOf(query) >= 0;
      });
    }
    const limit = ML.clamp(parseInt(block.limit, 10) || 24, 1, 100);
    list = list.slice(0, limit);
    const title = block.title ? String(block.title) : String(t('stage.symbols.title'));
    const usage = props.symbolUsage instanceof Map ? props.symbolUsage : new Map();
    const activeSymbol = props.activeSymbol || null;
    const jumpTo = props.onJumpToIndex;
    let body;
    if (state.loading) body = h(ML.Loading, { label: t('stage.symbols.loading') });
    else if (state.error) body = h(ML.ErrorBox, { error: state.error, onRetry: load });
    else if (!list.length) body = h(ML.Empty, { label: t('stage.symbols.empty') });
    else {
      body = h(
        'div',
        { className: 'stage-sym-grid' },
        list.map(function (symbol, index) {
          const latex = typeof symbol.latex === 'string' ? symbol.latex : '';
          const glyph = String(symbol.unicode || symbol.symbol || symbol.id || '?');
          const name = symbolName(symbol, t);
          const altLang = ML.lang(t) === 'zh' ? 'en' : 'zh';
          const alt = ML.pick(altLang, symbol.name_zh, symbol.name);
          return h(
            'div',
            { key: String(symbol.id || index), className: 'stage-sym-card' },
            h('div', { className: 'stage-sym-glyph' }, latex ? h(ML.Math, { tex: latex }) : glyph),
            h('div', { className: 'stage-sym-name' }, name),
            alt && alt !== name ? h('div', { className: 'stage-sym-alt' }, alt) : null,
            latex ? h('div', { className: 'stage-sym-latex' }, latex) : null,
            h(
              'div',
              { className: 'stage-chips' },
              latex ? h(ML.CopyBtn, { size: 'sm', text: latex, label: t('stage.symbols.copyLatex') }) : null,
              glyph ? h(ML.CopyBtn, { size: 'sm', text: glyph, label: t('common.copyText') }) : null,
            ),
          );
        }),
      );
    }
    const usageRows = [];
    const seenUsage = new Set();
    for (const symbol of list) {
      const key = symbol && symbol.id ? String(symbol.id) : '';
      if (!key || seenUsage.has(key)) continue;
      const steps = usage.get(key) || [];
      if (!steps.length) continue;
      seenUsage.add(key);
      usageRows.push({ id: key, symbol: symbol, steps: steps });
    }
    return h(
      'div',
      { className: 'stage-symbols' + (activeSymbol ? ' has-active-symbol' : '') },
      h(BlockTitle, { title: title }),
      body,
      usageRows.length > 1
        ? h(SymbolGraph, {
            rows: usageRows,
            label: t('stage.symbols.graph'),
            activeSymbol: activeSymbol,
            onSymbolClick: props.onSymbolClick,
            jumpTo: jumpTo,
          })
        : null,
      block.caption ? h('div', { className: 'stage-caption' }, String(block.caption)) : null,
    );
  }

  function LeanBlock(props) {
    const t = tr(props.t);
    const block = props.block || {};
    const code = typeof block.code === 'string' ? block.code : ML.safeString(block.code === undefined ? '' : block.code, 8000);
    const imports = ML.toArr(block.imports)
      .map(String)
      .filter(Boolean);
    const fullCode = (imports.length ? imports.join('\n') + '\n\n' : '') + code;
    const [check, setCheck] = useState({ loading: false, error: null, result: null });
    const aliveRef = useRef(true);
    useEffect(function () {
      aliveRef.current = true;
      return function () {
        aliveRef.current = false;
      };
    }, []);
    const run = useCallback(
      function () {
        setCheck({ loading: true, error: null, result: null });
        ML.callMath('lean.check', { code: fullCode })
          .then(function (result) {
            if (aliveRef.current) setCheck({ loading: false, error: null, result: result });
          })
          .catch(function (error) {
            if (aliveRef.current) setCheck({ loading: false, error: error, result: null });
          });
      },
      [fullCode],
    );
    const result = check.result || null;
    const diagnostics = ML.toArr(block.diagnostics).length
      ? ML.toArr(block.diagnostics)
      : ML.toArr(result && result.diagnostics);
    const ok = result && result.ok !== undefined ? !!result.ok : undefined;
    const title = block.title ? String(block.title) : String(t('stage.lean.title'));
    return h(
      'div',
      { className: 'stage-lean' },
      h(
        'div',
        { className: 'stage-lean-hd' },
        h('span', { className: 'stage-block-title' }, title),
        ok === true
          ? h(ML.Badge, { tone: 'success' }, t('stage.lean.ok'))
          : ok === false
            ? h(ML.Badge, { tone: 'error' }, t('stage.lean.failed'))
            : null,
        h('span', { className: 'stage-spacer' }),
        h(ML.CopyBtn, { size: 'sm', text: fullCode, label: t('common.copyText') }),
        block.check === true
          ? h(
              ML.Btn,
              { size: 'sm', onClick: run, disabled: check.loading },
              check.loading ? t('stage.lean.checking') : t('stage.lean.check'),
            )
          : null,
      ),
      imports.length
        ? h(
            'div',
            { className: 'stage-chips' },
            h('span', { className: 'stage-caption' }, t('stage.lean.imports')),
            imports.map(function (item, index) {
              return h(ML.Badge, { key: index, tone: 'idle' }, item);
            }),
          )
        : null,
      h('pre', { className: 'ml-pre stage-code' }, fullCode),
      check.error ? h(ML.ErrorBox, { error: check.error, onRetry: run }) : null,
      check.loading ? h(ML.Loading, { label: t('stage.lean.checking') }) : null,
      diagnostics.length
        ? h(
            'div',
            null,
            h('div', { className: 'stage-caption' }, t('stage.lean.diagnostics')),
            h(ML.LabeledTable, {
              rowLabels: diagnostics.map(function (item, index) {
                return String(index + 1);
              }),
              colLabels: [t('lean.severity'), t('lean.line'), t('lean.column'), t('lean.message')],
              cells: diagnostics.map(function (diagnostic) {
                return [
                  String((diagnostic && diagnostic.severity) || 'info'),
                  diagnostic && diagnostic.line !== undefined ? String(diagnostic.line) : '',
                  diagnostic && diagnostic.column !== undefined ? String(diagnostic.column) : '',
                  ML.safeString(diagnostic && diagnostic.message !== undefined ? diagnostic.message : diagnostic, 800),
                ];
              }),
              cellClass: function (cell, rowIndex) {
                const diagnostic = diagnostics[rowIndex];
                const severity = String((diagnostic && diagnostic.severity) || '').toLowerCase();
                if (severity === 'error') return 'ml-tt-f';
                if (severity === 'warning') return 'ml-tt-result';
                return undefined;
              },
            }),
          )
        : result && diagnostics.length === 0
          ? h(ML.Banner, { tone: ok === false ? 'warn' : 'success' }, t('stage.lean.noDiagnostics'))
          : null,
      result && result.stdout ? h(ML.Collapse, { title: t('stage.lean.stdout') }, h('pre', { className: 'ml-pre' }, ML.safeString(result.stdout))) : null,
      result && result.stderr ? h(ML.Collapse, { title: t('stage.lean.stderr') }, h('pre', { className: 'ml-pre' }, ML.safeString(result.stderr))) : null,
      result ? h(ML.RawJSON, { value: result }) : null,
    );
  }

  function TakeawayCard(props) {
    const t = tr(props.t);
    const takeaway = ML.isObj(props.takeaway) ? props.takeaway : {};
    const title = props.title ? String(props.title) : String(t('stage.takeaway.title'));
    const rows = [
      ['claim', 'stage.takeaway.claim'],
      ['method', 'stage.takeaway.method'],
      ['generalization', 'stage.takeaway.generalization'],
      ['scope', 'stage.takeaway.scope'],
    ].filter(function (row) {
      const value = takeaway[row[0]];
      return value !== undefined && value !== null && String(value).trim() !== '';
    });
    const examples = ML.toArr(takeaway.examples)
      .map(String)
      .filter(Boolean);
    const references = ML.toArr(takeaway.references)
      .map(String)
      .filter(Boolean);
    const markdown = takeawayMarkdown(takeaway, title, t);
    const download = function () {
      ML.download('takeaway-' + slugify(title) + '.md', markdown, 'text/markdown;charset=utf-8');
    };
    return h(
      'section',
      { className: 'stage-takeaway', 'aria-label': title },
      h(
        'div',
        { className: 'stage-takeaway-hd' },
        h('span', { className: 'stage-takeaway-icon', 'aria-hidden': true }, '✦'),
        h('h3', { className: 'stage-takeaway-title' }, title),
        h('span', { className: 'stage-spacer' }),
        h(ML.CopyBtn, { size: 'sm', text: markdown, label: t('stage.takeaway.copy') }),
        h(ML.Btn, { size: 'sm', onClick: download }, t('stage.takeaway.download')),
      ),
      rows.map(function (row) {
        return h(
          'div',
          { className: 'stage-takeaway-row', key: row[0] },
          h('div', { className: 'stage-takeaway-label' }, t(row[1])),
          h('div', { className: 'stage-takeaway-value' }, h(MarkdownLite, { text: String(takeaway[row[0]]) })),
        );
      }),
      examples.length
        ? h(
            'div',
            { className: 'stage-takeaway-row' },
            h('div', { className: 'stage-takeaway-label' }, t('stage.takeaway.examples')),
            h(
              'div',
              { className: 'stage-takeaway-value' },
              h(
                'ul',
                { className: 'stage-takeaway-list' },
                examples.map(function (example, index) {
                  return h('li', { key: index }, h(MarkdownLite, { text: example }));
                }),
              ),
            ),
          )
        : null,
      references.length
        ? h(
            'div',
            { className: 'stage-takeaway-row' },
            h('div', { className: 'stage-takeaway-label' }, t('stage.takeaway.references')),
            h(
              'div',
              { className: 'stage-takeaway-value' },
              h(
                'ul',
                { className: 'stage-takeaway-list' },
                references.map(function (reference, index) {
                  return h('li', { key: index }, h(MarkdownLite, { text: reference }));
                }),
              ),
            ),
          )
        : null,
    );
  }

  function TakeawayBlock(props) {
    const block = props.block || {};
    return h(TakeawayCard, {
      takeaway: block,
      title: block.title,
      t: props.t,
    });
  }

  function NoteBlock(props) {
    const t = tr(props.t);
    const block = props.block || {};
    return h(
      'div',
      { className: 'stage-note' },
      h('div', { className: 'stage-caption' }, t('stage.note.title')),
      h(MarkdownLite, { text: block.text === undefined ? '' : block.text }),
    );
  }

  function UnknownBlock(props) {
    return h(RawBlock, { block: props.block, t: props.t });
  }

  const VERDICT_TONES = {
    goal: 'brand',
    assume: 'warn',
    have: 'success',
    rule: 'idle',
    check: 'brand',
    contradiction: 'error',
    conclusion: 'success',
  };

  const KIND_LABELS = {
    heading: 'stage.kind.heading',
    prose: 'stage.kind.prose',
    math: 'stage.kind.math',
    judgment: 'stage.kind.judgment',
    strategy: 'stage.kind.strategy',
    proof: 'stage.kind.proof',
    diagram: 'stage.kind.diagram',
    plot: 'stage.kind.plot',
    compute: 'stage.kind.compute',
    symbols: 'stage.kind.symbols',
    lean: 'stage.kind.lean',
    takeaway: 'stage.kind.takeaway',
    note: 'stage.kind.note',
  };

  function kindLabel(kind, t) {
    const key = KIND_LABELS[kind];
    if (key) return String(t(key));
    return String(t('stage.kind.unknown')) + (kind ? ' · ' + kind : '');
  }

  function BlockContent(props) {
    const kind = blockKindOf(props.block);
    if (kind === 'heading') return h(HeadingBlock, props);
    if (kind === 'prose') return h(ProseBlock, props);
    if (kind === 'math') return h(MathBlock, props);
    if (kind === 'judgment') return h(JudgmentBlock, props);
    if (kind === 'strategy') return h(StrategyBlock, props);
    if (kind === 'proof') return h(ProofBlock, props);
    if (kind === 'diagram') return h(DiagramBlock, props);
    if (kind === 'plot') return h(PlotBlock, props);
    if (kind === 'compute') return h(ComputeBlock, props);
    if (kind === 'symbols') return h(SymbolsBlock, props);
    if (kind === 'lean') return h(LeanBlock, props);
    if (kind === 'takeaway') return h(TakeawayBlock, props);
    if (kind === 'note') return h(NoteBlock, props);
    return h(UnknownBlock, props);
  }

  function BlockView(props) {
    const t = tr(props.t);
    const block = props.block;
    const kind = blockKindOf(block);
    const [editorOpen, setEditorOpen] = useState(false);
    const [note, setNote] = useState('');
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState(null);
    const annotations = ML.toArr(props.annotations);
    const submit = function () {
      const text = String(note || '').trim();
      if (!text) {
        setSaveError(String(t('stage.annotate.empty')));
        return;
      }
      setSaving(true);
      setSaveError(null);
      ML.callMath('stage.annotate', { blockId: props.blockId, note: text, sessionId: props.sessionId })
        .then(function () {
          setSaving(false);
          setNote('');
          setEditorOpen(false);
          if (typeof props.onChanged === 'function') props.onChanged();
        })
        .catch(function (error) {
          setSaving(false);
          setSaveError(ML.errText(error, t));
        });
    };
    return h(
      'article',
      {
        className:
          'stage-block' +
          (props.current ? ' is-current' : '') +
          (props.activeSymbol && ML.toArr(block.symbols).map(String).indexOf(props.activeSymbol) >= 0
            ? ' is-symbol-focus'
            : '') +
          ' stage-block-' +
          kind,
        'data-stage-block': props.blockId,
        ref: props.innerRef,
        'aria-current': props.current ? 'step' : undefined,
      },
      h(
        'div',
        { className: 'stage-block-hd' },
        h(
          'button',
          {
            type: 'button',
            className: 'stage-step-no',
            title: ML.fmt(t, 'stage.jumpTo', { n: props.index + 1 }),
            'aria-label': ML.fmt(t, 'stage.jumpTo', { n: props.index + 1 }),
            onClick: function () {
              if (typeof props.onJump === 'function') props.onJump(props.index);
            },
          },
          String(props.index + 1),
        ),
        h('span', { className: 'stage-kind' }, kindLabel(kind, t)),
        block && typeof block.title === 'string' && block.title && kind !== 'heading' && kind !== 'takeaway'
          ? h('span', { className: 'stage-block-title' }, block.title)
          : null,
        h(
          'div',
          { className: 'stage-block-actions' },
          h(
            ML.Btn,
            {
              size: 'sm',
              variant: 'subtle',
              onClick: function () {
                setEditorOpen(function (open) {
                  return !open;
                });
              },
              'aria-expanded': editorOpen,
              title: t('stage.annotate'),
            },
            t('stage.annotate') + (annotations.length ? ' · ' + annotations.length : ''),
          ),
        ),
      ),
      h(ML.Boundary, null, h(BlockContent, {
        block: block,
        t: t,
        symbolUsage: props.symbolUsage,
        activeSymbol: props.activeSymbol,
        onSymbolClick: props.onSymbolClick,
        onJumpToIndex: props.onJumpToIndex,
      })),
      annotations.length
        ? h(
            'div',
            { className: 'stage-annot' },
            annotations.map(function (annotation, index) {
              const item = ML.isObj(annotation) ? annotation : { note: annotation };
              const text = item.note !== undefined && item.note !== null ? String(item.note) : ML.safeString(item);
              return h(
                'div',
                { key: String(item.id || index), className: 'stage-annot-item' },
                h('span', { className: 'stage-annot-mark', 'aria-hidden': true }, '✎'),
                h('span', { className: 'stage-annot-text' }, text),
                item.at ? h('time', { className: 'stage-annot-time' }, fmtTime(item.at)) : null,
              );
            }),
          )
        : null,
      editorOpen
        ? h(
            'div',
            { className: 'stage-annot-editor' },
            h(ML.Textarea, {
              rows: 3,
              value: note,
              placeholder: t('stage.annotate.placeholder'),
              'aria-label': t('stage.annotate'),
              onChange: function (event) {
                setNote(event.target.value);
              },
            }),
            saveError ? h(ML.Banner, { tone: 'error' }, saveError) : null,
            h(
              'div',
              { className: 'ml-row' },
              h(ML.Btn, { size: 'sm', variant: 'primary', onClick: submit, disabled: saving }, saving ? t('common.loading') : t('stage.annotate.save')),
              h(
                ML.Btn,
                {
                  size: 'sm',
                  onClick: function () {
                    setEditorOpen(false);
                    setSaveError(null);
                  },
                },
                t('common.close'),
              ),
            ),
          )
        : null,
    );
  }

  /* ------------------------------------------------------------- sub-views */

  function StepStrip(props) {
    const count = props.count;
    if (!count || count < 2) return null;
    const buttons = [];
    for (let index = 0; index < count; index += 1) {
      buttons.push(
        h(
          'button',
          {
            key: index,
            type: 'button',
            className: 'stage-step-btn' + (index === props.index ? ' is-active' : ''),
            'aria-current': index === props.index ? 'step' : undefined,
            title: ML.fmt(props.t, 'stage.jumpTo', { n: index + 1 }),
            onClick: function () {
              props.onJump(index);
            },
          },
          String(index + 1),
        ),
      );
    }
    return h('div', { className: 'stage-steps', role: 'group', 'aria-label': props.label }, buttons);
  }

  function TraceView(props) {
    const t = tr(props.t);
    const trace = ML.toArr(props.trace);
    const entries = trace.slice().reverse().slice(0, 200);
    const copyAll = function () {
      ML.copy(ML.prettyJSON(trace)).then(function (ok) {
        if (typeof props.onToast === 'function') {
          props.onToast(ok ? t('stage.trace.copied') : t('common.copyFailed'), ok ? 'success' : 'error');
        }
      });
    };
    return h(
      'div',
      { className: 'stage-trace' },
      h('div', { className: 'stage-caption' }, t('stage.trace.hint')),
      h(
        'div',
        { className: 'stage-trace-toolbar' },
        h(ML.Badge, { tone: 'idle' }, ML.fmt(t, 'stage.trace.count', { n: trace.length })),
        h('span', { className: 'stage-spacer' }),
        h(ML.Btn, { size: 'sm', onClick: props.onRefresh, disabled: !!props.loading }, props.loading ? t('common.loading') : t('stage.refresh')),
        h(ML.Btn, { size: 'sm', onClick: copyAll, disabled: trace.length === 0 }, t('stage.trace.copyAll')),
      ),
      trace.length === 0
        ? h(ML.Empty, { label: t('stage.trace.empty') })
        : h(
            'ol',
            { className: 'stage-trace-list' },
            entries.map(function (entry, index) {
              const item = ML.isObj(entry) ? entry : { summary: String(entry) };
              const tool = item.tool || item.source || 'mathlab';
              const op = typeof item.op === 'string' ? item.op : '';
              return h(
                'li',
                { key: index, className: 'stage-trace-item' },
                h(
                  'div',
                  { className: 'stage-trace-hd' },
                  h(ML.Badge, { tone: 'brand' }, String(tool)),
                  op ? h('code', { className: 'stage-trace-op' }, op) : null,
                  item.summary ? h('span', { className: 'stage-trace-summary' }, ML.safeString(item.summary, 300)) : null,
                  h('span', { className: 'stage-spacer' }),
                  h(ML.CopyBtn, { size: 'sm', text: ML.prettyJSON(item), label: t('common.copy') }),
                  item.at ? h('time', { className: 'stage-trace-time' }, fmtTime(item.at)) : null,
                ),
                h(
                  ML.Collapse,
                  { title: t('common.details') },
                  h(
                    'div',
                    { className: 'stage-trace-cols' },
                    h(
                      'div',
                      null,
                      h('div', { className: 'stage-caption' }, t('stage.trace.args')),
                      h(ML.JSONTree, { value: item.args === undefined ? {} : item.args }),
                    ),
                    h(
                      'div',
                      null,
                      h('div', { className: 'stage-caption' }, t('stage.trace.result')),
                      h(ML.JSONTree, { value: item.result === undefined ? {} : item.result }),
                    ),
                  ),
                ),
              );
            }),
          ),
    );
  }

  function StageEmpty(props) {
    const t = tr(props.t);
    const trace = ML.toArr(props.trace);
    const samples = [t('stage.empty.sample1'), t('stage.empty.sample2'), t('stage.empty.sample3')];
    const recent = trace.slice(-5).reverse();
    return h(
      'div',
      { className: 'stage-empty' },
      h('div', { className: 'stage-empty-mark', 'aria-hidden': true }, '∎'),
      h('h2', { className: 'stage-empty-title' }, t('stage.empty.title')),
      h('div', { className: 'stage-empty-body' }, h(MarkdownLite, { text: t('stage.empty.body') })),
      h('div', { className: 'stage-empty-ask' }, t('stage.empty.ask')),
      h(
        'ul',
        { className: 'stage-empty-list' },
        samples.map(function (sample, index) {
          return h('li', { key: index }, h('code', { className: 'stage-empty-sample' }, String(sample)));
        }),
      ),
      h('div', { className: 'stage-empty-tool' }, h(MarkdownLite, { text: t('stage.empty.tool') })),
      recent.length
        ? h(
            ML.Collapse,
            { title: t('stage.trace.title'), summary: ML.fmt(t, 'stage.trace.count', { n: trace.length }) },
            h(
              'ol',
              { className: 'stage-trace-list' },
              recent.map(function (entry, index) {
                const item = ML.isObj(entry) ? entry : { summary: String(entry) };
                return h(
                  'li',
                  { key: index, className: 'stage-trace-item' },
                  h(
                    'div',
                    { className: 'stage-trace-hd' },
                    h(ML.Badge, { tone: 'brand' }, String(item.tool || item.source || 'mathlab')),
                    item.op ? h('code', { className: 'stage-trace-op' }, String(item.op)) : null,
                    h('span', { className: 'stage-trace-summary' }, ML.safeString(item.summary || '', 200)),
                    item.at ? h('time', { className: 'stage-trace-time' }, fmtTime(item.at)) : null,
                  ),
                );
              }),
            ),
          )
        : null,
    );
  }

  function QuestionBox(props) {
    const t = tr(props.t);
    const [text, setText] = useState('');
    const [saving, setSaving] = useState(false);
    const stage = props.stage;
    const questions = ML.toArr(stage && stage.questions);
    const ask = function () {
      const value = String(text || '').trim();
      if (!value) {
        if (typeof props.onToast === 'function') props.onToast(t('stage.question.empty'), 'warn');
        return;
      }
      setSaving(true);
      ML.callMath('stage.question', { blockId: props.blockId || undefined, text: value, sessionId: props.sessionId })
        .then(function () {
          return ML.copy(value).then(function (copied) {
            setSaving(false);
            setText('');
            if (typeof props.onToast === 'function') {
              props.onToast(copied ? t('stage.question.saved') : t('stage.question.copiedOnly'), copied ? 'success' : 'warn');
            }
            if (typeof props.onChanged === 'function') props.onChanged();
          });
        })
        .catch(function (error) {
          /* the question was not recorded, but copying it still helps the user */
          ML.copy(value).then(function () {
            setSaving(false);
            if (typeof props.onToast === 'function') {
              props.onToast(ML.errText(error, t) + ' · ' + t('stage.question.copiedOnly'), 'error');
            }
          });
        });
    };
    return h(
      'section',
      { className: 'stage-question', 'aria-label': t('stage.question.title') },
      h(
        'h3',
        { className: 'stage-question-title' },
        t('stage.question.title'),
        props.blockId ? h('span', { className: 'stage-caption' }, ' · ' + t('stage.current') + ' #' + String(props.currentIndex + 1)) : null,
      ),
      h('div', { className: 'stage-hint' }, t('stage.question.hint')),
      h(ML.Textarea, {
        rows: 2,
        value: text,
        placeholder: t('stage.question.placeholder'),
        'aria-label': t('stage.question.title'),
        onChange: function (event) {
          setText(event.target.value);
        },
      }),
      h(
        'div',
        { className: 'ml-row' },
        h(ML.Btn, { variant: 'primary', onClick: ask, disabled: saving }, saving ? t('common.loading') : t('stage.question.submit')),
      ),
      questions.length
        ? h(
            'div',
            { className: 'stage-question-list' },
            h('div', { className: 'stage-caption' }, t('stage.question.list')),
            questions
              .slice()
              .reverse()
              .slice(0, 50)
              .map(function (question, index) {
                const item = ML.isObj(question) ? question : { text: String(question) };
                const body = item.text !== undefined && item.text !== null ? String(item.text) : ML.safeString(item);
                return h(
                  'div',
                  { key: String(item.id || index), className: 'stage-q-item' },
                  h('span', { className: 'stage-q-text' }, body),
                  item.quote ? h('div', { className: 'stage-q-quote' }, '「' + String(item.quote) + '」') : null,
                  item.blockId ? h(ML.Badge, { tone: 'idle' }, String(item.blockId)) : null,
                  item.at ? h('time', { className: 'stage-q-time' }, fmtTime(item.at)) : null,
                  h(ML.CopyBtn, { size: 'sm', text: (item.quote ? '「' + item.quote + '」\n' : '') + body, label: t('common.copy') }),
                );
              }),
          )
        : null,
    );
  }

  /* ----------------------------------------------------------------- StageTab */

  /**
   * Live revision stream (SSE) for one Session. Silent fallback: the caller
   * keeps its ~900 ms poll, so a blocked EventSource only loses push latency.
   */
  function useStageStream(sessionId, onRevision) {
    const callbackRef = React.useRef(onRevision);
    callbackRef.current = onRevision;
    useEffect(
      function () {
        if (!sessionId || typeof EventSource === 'undefined') return undefined;
        let source = null;
        let last = null;
        try {
          source = new EventSource('/api/mathlab/events?sessionId=' + encodeURIComponent(sessionId));
        } catch (streamError) {
          return undefined;
        }
        const onStage = function (event) {
          try {
            const payload = JSON.parse(event.data);
            const revision = payload && typeof payload.revision === 'number' ? payload.revision : null;
            if (revision !== null && revision !== last) {
              last = revision;
              if (typeof callbackRef.current === 'function') callbackRef.current();
            }
          } catch (parseError) {
            /* ignore malformed frames; polling still converges */
          }
        };
        try {
          source.addEventListener('stage', onStage);
        } catch (listenError) {
          try {
            source.onmessage = onStage;
          } catch (assignError) {
            /* no stream support */
          }
        }
        return function () {
          try {
            source.removeEventListener('stage', onStage);
          } catch (removeError) {
            /* ignore */
          }
          try {
            source.close();
          } catch (closeError) {
            /* ignore */
          }
        };
      },
      [sessionId],
    );
  }

  function StageTab(props) {
    const t = ML.useT();
    const sessionId = typeof props.sessionId === 'string' && props.sessionId !== '' ? props.sessionId : undefined;
    const embedded = props.embedded === true;
    const pinned = props.pinned === true;
    const withSession = function (extra) {
      const payload = Object.assign({}, extra);
      if (sessionId) payload.sessionId = sessionId;
      return payload;
    };
    const [doc, setDoc] = useState({ stage: null, revision: null, trace: [] });
    const [loading, setLoading] = useState(true);
    const [hasLoaded, setHasLoaded] = useState(false);
    const [error, setError] = useState(null);
    const [syncedAt, setSyncedAt] = useState(null);
    const [view, setView] = useState('blocks');
    const [index, setIndex] = useState(0);
    const [follow, setFollow] = useState(true);
    const [toast, setToast] = useState(null);
    const [exporting, setExporting] = useState(false);
    const [activeSymbol, setActiveSymbol] = useState(null);
    const [zoom, setZoom] = useState(function () {
      try {
        const stored = parseFloat(ML.storage.get('stage.zoom', '1'));
        return Number.isFinite(stored) ? Math.min(1.75, Math.max(0.75, stored)) : 1;
      } catch (storageError) {
        return 1;
      }
    });
    const changeZoom = function (delta) {
      setZoom(function (current) {
        const next = Math.min(1.75, Math.max(0.75, Math.round((current + delta) * 100) / 100));
        try {
          ML.storage.set('stage.zoom', String(next));
        } catch (storageError) {
          /* zoom is a convenience */
        }
        return next;
      });
    };
    const [selectionAsk, setSelectionAsk] = useState(null);
    const [askOpen, setAskOpen] = useState(false);
    const [askText, setAskText] = useState('');
    const [askSaving, setAskSaving] = useState(false);
    const stageRootRef = useRef(null);
    const askBoxRef = useRef(null);

    const stage = doc.stage;
    const blocks = ML.toArr(stage && stage.blocks);
    const currentBlock = blocks[index] || null;
    const currentBlockId = currentBlock
      ? typeof currentBlock.id === 'string' && currentBlock.id
        ? currentBlock.id
        : 'b' + (index + 1)
      : undefined;

    const activeRef = useRef(false);
    const followRef = useRef(true);
    const blocksRef = useRef([]);
    const indexRef = useRef(0);
    const firstLoadRef = useRef(true);
    const prevRevisionRef = useRef(null);
    const focusRef = useRef(null);
    const sigRef = useRef(null);
    const autoSwitchRef = useRef(null);
    const toastTimer = useRef(null);
    const currentRef = useRef(null);
    const pushCursorRef = useRef(null);

    activeRef.current = !!props.active;
    followRef.current = follow;
    blocksRef.current = blocks;
    indexRef.current = index;

    const showToast = useCallback(function (message, tone) {
      setToast({ message: String(message === undefined || message === null ? '' : message), tone: tone || 'success' });
      clearTimeout(toastTimer.current);
      toastTimer.current = setTimeout(function () {
        setToast(null);
      }, 2800);
    }, []);

    useEffect(function () {
      return function () {
        clearTimeout(toastTimer.current);
      };
    }, []);

    const applyPayload = useCallback(function (payload) {
      const normalized = normalizeStagePayload(payload);
      const nextStage = normalized.stage;
      const nextRevision = normalized.revision;
      const list = ML.toArr(nextStage && nextStage.blocks);
      const firstLoad = firstLoadRef.current;
      const isChange = !firstLoad && nextRevision !== null && prevRevisionRef.current !== null && nextRevision !== prevRevisionRef.current;
      let signature = '';
      try {
        /* Compare the whole block payload, not just ids: content edits inside a
         * revision should also refresh the visible board. */
        signature = JSON.stringify(list);
      } catch (signatureError) {
        signature = '';
      }
      const blocksChanged = sigRef.current !== null && sigRef.current !== signature;
      const focusRaw = nextStage && nextStage.focus !== undefined && nextStage.focus !== null ? Number(nextStage.focus) : NaN;
      const focusChanged = Number.isFinite(focusRaw) && focusRef.current !== null && focusRaw !== focusRef.current;
      focusRef.current = Number.isFinite(focusRaw) ? focusRaw : null;

      setDoc({
        stage: nextStage,
        revision: nextRevision,
        trace: normalized.trace,
      });
      setLoading(false);
      setHasLoaded(true);
      setError(null);
      setSyncedAt(Date.now());

      if (followRef.current && (firstLoad || isChange || focusChanged)) {
        const target = Number.isFinite(focusRaw) ? focusRaw : indexRef.current;
        setIndex(clampIndex(target, list.length));
      } else if (list.length && indexRef.current > list.length - 1) {
        setIndex(list.length - 1);
      }

      if (!firstLoad && blocksChanged && nextStage && nextStage.autoShow !== false && !activeRef.current && !embedded && autoSwitchRef.current !== nextRevision) {
        autoSwitchRef.current = nextRevision;
        try {
          ML.bus.emit('activate', { tab: 'stage' });
        } catch (busError) {
          /* the host may not wire the event yet in an older build */
        }
      }

      firstLoadRef.current = false;
      prevRevisionRef.current = nextRevision;
      sigRef.current = signature;
    }, []);

    const load = useCallback(
      async function () {
        try {
          const payload = await ML.callMath('stage.get', withSession({}));
          applyPayload(payload);
        } catch (loadError) {
          setError(loadError);
          setLoading(false);
        }
      },
      [applyPayload, sessionId],
    );

    useStageStream(sessionId, load);

    /* ~900 ms poll; the first tick also covers the initial load. */
    useEffect(
      function () {
        let alive = true;
        let timer = null;
        const tick = function () {
          if (!alive) return;
          ML.callMath('stage.get', withSession({}))
            .then(function (payload) {
              if (alive) applyPayload(payload);
            })
            .catch(function (loadError) {
              if (alive) {
                setError(loadError);
                setLoading(false);
              }
            })
            .then(function () {
              if (alive) timer = setTimeout(tick, 900);
            });
        };
        tick();
        return function () {
          alive = false;
          clearTimeout(timer);
        };
      },
      [applyPayload, sessionId],
    );

    useEffect(
      function () {
        if (props.active) load();
      },
      [props.active, load],
    );

    /* Cursor sync is debounced; it never rewrites blocks. */
    const postCursor = useCallback(function (value) {
      const list = blocksRef.current;
      if (!list.length) return;
      const target = clampIndex(value, list.length);
      const block = list[target];
      const payload = withSession({ index: target });
      if (block && typeof block.id === 'string' && block.id) payload.blockId = block.id;
      ML.callMath('stage.cursor', payload).catch(function () {
        /* the cursor is a best-effort nicety */
      });
    }, []);
    if (!pushCursorRef.current) pushCursorRef.current = ML.debounce(postCursor, 400);

    const setStep = useCallback(
      function (next, options) {
        const list = blocksRef.current;
        if (!list.length) return;
        const opts = options || {};
        const target = clampIndex(next, list.length);
        setIndex(target);
        if (opts.free !== false) setFollow(false);
        if (opts.sync !== false && pushCursorRef.current) pushCursorRef.current(target);
      },
      [],
    );

    const stepBy = useCallback(
      function (delta) {
        setStep(indexRef.current + delta);
      },
      [setStep],
    );

    /* Symbol -> step connectivity: which blocks cite each symbol. */
    const symbolUsage = useMemo(
      function () {
        const map = new Map();
        blocks.forEach(function (block, blockIndex) {
          if (!ML.isObj(block)) return;
          const ids = ML.toArr(block.symbols)
            .map(String)
            .filter(Boolean);
          for (const id of ids) {
            if (!map.has(id)) map.set(id, []);
            if (map.get(id).indexOf(blockIndex) < 0) map.get(id).push(blockIndex);
          }
        });
        return map;
      },
      [blocks],
    );

    const jumpToBlock = useCallback(
      function (target) {
        setStep(target);
      },
      [setStep],
    );

    /* Selection -> question: select text inside a block, then ask about it. */
    useEffect(
      function () {
        if (!selectionAsk) return undefined;
        const onPointerDown = function (event) {
          if (askBoxRef.current && askBoxRef.current.contains(event.target)) return;
          const target = event.target;
          if (target && typeof target.closest === 'function' && target.closest('.stage-select-ask')) return;
          setSelectionAsk(null);
          setAskOpen(false);
        };
        const onKey = function (event) {
          if (event.key === 'Escape') {
            setSelectionAsk(null);
            setAskOpen(false);
          }
        };
        document.addEventListener('mousedown', onPointerDown, true);
        document.addEventListener('keydown', onKey, true);
        return function () {
          document.removeEventListener('mousedown', onPointerDown, true);
          document.removeEventListener('keydown', onKey, true);
        };
      },
      [selectionAsk],
    );

    const onStageMouseUp = function (event) {
      const target = event.target;
      if (target && typeof target.closest === 'function' && target.closest('input,textarea,[contenteditable="true"]')) return;
      let selection = null;
      try {
        selection = window.getSelection();
      } catch (selectionError) {
        return;
      }
      if (!selection || selection.isCollapsed) return;
      const text = String(selection.toString()).replace(/\s+/g, ' ').trim();
      if (text.length < 2 || text.length > 600) return;
      const anchor = selection.anchorNode;
      const element = anchor && anchor.nodeType === 1 ? anchor : anchor && anchor.parentElement;
      const blockElement = element && typeof element.closest === 'function' ? element.closest('[data-stage-block]') : null;
      if (!blockElement) return;
      if (stageRootRef.current && !stageRootRef.current.contains(blockElement)) return;
      let rect = null;
      try {
        rect = selection.getRangeAt(0).getBoundingClientRect();
      } catch (rangeError) {
        return;
      }
      if (!rect || (!rect.width && !rect.height)) return;
      setSelectionAsk({
        text: text,
        blockId: blockElement.getAttribute('data-stage-block'),
        x: rect.left + rect.width / 2,
        y: rect.top,
        bottom: rect.bottom,
      });
      setAskOpen(false);
    };

    const submitSelectionQuestion = function () {
      const question = askText.trim();
      if (!question) {
        showToast(t('stage.ask.empty'), 'warn');
        return;
      }
      if (!selectionAsk) return;
      setAskSaving(true);
      const combined = '「' + selectionAsk.text + '」\n' + question;
      ML.callMath('stage.question', withSession({ blockId: selectionAsk.blockId, text: combined }))
        .then(function () {
          setAskSaving(false);
          let delivered = false;
          try {
            delivered =
              typeof props.onAskQuestion === 'function'
                ? !!props.onAskQuestion(combined)
                : typeof ML.sendToComposer === 'function' && sessionId
                  ? !!ML.sendToComposer(sessionId, combined)
                  : false;
          } catch (sendError) {
            delivered = false;
          }
          ML.copy(combined).then(function (copied) {
            showToast(
              delivered ? t('stage.ask.sent') : copied ? t('stage.ask.saved') : t('stage.ask.savedNoCopy'),
              delivered || copied ? 'success' : 'warn',
            );
          });
          setSelectionAsk(null);
          setAskOpen(false);
          setAskText('');
          load();
        })
        .catch(function (error) {
          setAskSaving(false);
          showToast(ML.errText(error, t), 'error');
        });
    };

    const enableFollow = function () {
      setFollow(true);
      if (stage) {
        const focusRaw = stage.focus !== undefined && stage.focus !== null ? Number(stage.focus) : NaN;
        setIndex(clampIndex(Number.isFinite(focusRaw) ? focusRaw : 0, blocks.length));
      }
    };

    /* Arrow keys step through the board while this tab is active. */
    useEffect(
      function () {
        if (!props.active) return undefined;
        const onKeyDown = function (event) {
          if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.altKey) return;
          const target = event.target;
          const tag = target && target.tagName ? String(target.tagName).toLowerCase() : '';
          if (tag === 'input' || tag === 'textarea' || tag === 'select' || (target && target.isContentEditable)) return;
          /* leave arrow keys to the roving-tab focus in the 讲解/过程轨迹 Tabs */
          if (target && typeof target.closest === 'function' && target.closest('.ml-tabs')) return;
          if (event.key === 'ArrowLeft') {
            event.preventDefault();
            stepBy(-1);
          } else if (event.key === 'ArrowRight') {
            event.preventDefault();
            stepBy(1);
          }
        };
        document.addEventListener('keydown', onKeyDown, true);
        return function () {
          document.removeEventListener('keydown', onKeyDown, true);
        };
      },
      [props.active, stepBy],
    );

    /* Keep the current step visible without scrolling the whole page. */
    useEffect(
      function () {
        const node = currentRef.current;
        if (!node || typeof node.scrollIntoView !== 'function') return;
        const scrollRoot = embedded && props.scrollRootRef ? props.scrollRootRef.current : null;
        if (scrollRoot) {
          const nodeRect = node.getBoundingClientRect();
          const rootRect = scrollRoot.getBoundingClientRect();
          const delta = nodeRect.top - rootRect.top - 8;
          if (Math.abs(delta) > 4) scrollRoot.scrollTop += delta;
          return;
        }
        try {
          node.scrollIntoView({ block: 'nearest', inline: 'nearest' });
        } catch (scrollError) {
          /* older engines may not accept the options object */
        }
      },
      [index, view],
    );

    const annotationsByBlock = useMemo(
      function () {
        const map = new Map();
        for (const annotation of ML.toArr(stage && stage.annotations)) {
          if (!ML.isObj(annotation)) continue;
          const key = typeof annotation.blockId === 'string' ? annotation.blockId : '';
          if (!map.has(key)) map.set(key, []);
          map.get(key).push(annotation);
        }
        return map;
      },
      [stage],
    );

    const copyStep = function () {
      const block = blocksRef.current[indexRef.current];
      const text = blockLatex(block);
      if (!text) {
        showToast(t('common.noResult'), 'warn');
        return;
      }
      ML.copy(text).then(function (ok) {
        showToast(ok ? t('stage.copiedStep') : t('common.copyFailed'), ok ? 'success' : 'error');
      });
    };

    const exportMarkdown = function (copyOnly) {
      setExporting(true);
      const fallback = buildStageMarkdown(stage, t);
      ML.callMath('stage.export', withSession({ format: 'markdown' }))
        .then(function (result) {
          const data = ML.isObj(result) ? result : {};
          const markdown = typeof data.markdown === 'string' && data.markdown ? data.markdown : fallback;
          let filename = typeof data.filename === 'string' && data.filename ? data.filename : '';
          if (!filename) filename = 'stage-' + slugify(stage && stage.title) + '.md';
          if (!/\.(md|markdown)$/i.test(filename)) filename += '.md';
          if (copyOnly) {
            return ML.copy(markdown).then(function (ok) {
              showToast(ok ? t('stage.copiedMarkdown') : t('common.copyFailed'), ok ? 'success' : 'error');
            });
          }
          const ok = ML.download(filename, markdown, 'text/markdown;charset=utf-8');
          showToast(ok ? t('stage.exported') : t('common.copyFailed'), ok ? 'success' : 'error');
          return undefined;
        })
        .catch(function (exportError) {
          /* the Host op may not exist yet — fall back to a client-built file */
          const filename = 'stage-' + slugify(stage && stage.title) + '.md';
          if (copyOnly) {
            return ML.copy(fallback).then(function (ok) {
              showToast(ok ? t('stage.copiedMarkdown') : t('common.copyFailed'), ok ? 'success' : 'error');
            });
          }
          const ok = ML.download(filename, fallback, 'text/markdown;charset=utf-8');
          showToast(ok ? t('stage.exported') : ML.errText(exportError, t), ok ? 'success' : 'error');
          return undefined;
        })
        .then(function () {
          setExporting(false);
        });
    };

    /* -------------------------------------------------------------- render */

    const statusRaw = stage && typeof stage.status === 'string' ? stage.status.toLowerCase() : '';
    const statusTone = statusRaw === 'final' ? 'success' : statusRaw === 'live' ? 'brand' : 'idle';
    const statusLabel =
      statusRaw === 'live'
        ? String(t('stage.status.live'))
        : statusRaw === 'final'
          ? String(t('stage.status.final'))
          : statusRaw || String(t('stage.status.live'));
    const generalAnnotations = ML.toArr(annotationsByBlock.get(''));

    const header = h(
      'header',
      { className: 'stage-hd' },
      h(
        'div',
        { className: 'stage-hd-main' },
        h(
          'div',
          { className: 'stage-hd-text' },
          h('h2', { className: 'stage-title' }, stage && typeof stage.title === 'string' && stage.title ? stage.title : t('stage.untitled')),
          stage && typeof stage.subtitle === 'string' && stage.subtitle
            ? h('p', { className: 'stage-subtitle' }, stage.subtitle)
            : null,
        ),
        h(
          'div',
          { className: 'stage-pills' },
          stage
            ? h(
                'span',
                { className: 'ml-badge ml-badge-' + statusTone + (statusRaw === 'live' ? ' stage-pill-live' : '') },
                h('span', { className: 'stage-status-dot', 'aria-hidden': true }),
                statusLabel,
              )
            : null,
          doc.revision !== null && doc.revision !== undefined
            ? h(ML.Badge, { tone: 'idle' }, ML.fmt(t, 'stage.rev', { n: doc.revision }))
            : null,
          stage ? h(ML.Badge, { tone: 'idle' }, ML.fmt(t, 'stage.blocks', { n: blocks.length })) : null,
          h(
            'span',
            { className: 'stage-sync', role: 'status', 'aria-live': 'polite' },
            error ? t('stage.offline') : syncedAt ? t('stage.rev.synced') + ' · ' + fmtTime(syncedAt) : t('common.loading'),
          ),
        ),
      ),
      h(
        'div',
        { className: 'stage-tools' },
        h(
          'div',
          { className: 'stage-nav' },
          h(
            ML.Btn,
            {
              size: 'sm',
              variant: 'subtle',
              onClick: function () {
                setStep(indexRef.current - 1);
              },
              disabled: !blocks.length || index <= 0,
              'aria-label': t('stage.prev'),
            },
            '‹ ' + t('stage.prev'),
          ),
          h('span', { className: 'stage-step-label' }, blocks.length ? ML.fmt(t, 'stage.step', { i: index + 1, n: blocks.length }) : t('common.empty')),
          h(
            ML.Btn,
            {
              size: 'sm',
              variant: 'subtle',
              onClick: function () {
                setStep(indexRef.current + 1);
              },
              disabled: !blocks.length || index >= blocks.length - 1,
              'aria-label': t('stage.next'),
            },
            t('stage.next') + ' ›',
          ),
        ),
        h(
          ML.Btn,
          {
            size: 'sm',
            variant: follow ? 'primary' : 'ghost',
            className: 'stage-follow' + (follow ? ' is-active' : ''),
            'aria-pressed': follow,
            onClick: function () {
              if (follow) setFollow(false);
              else enableFollow();
            },
          },
          follow ? t('stage.follow') : t('stage.free'),
        ),
        h(ML.Tabs, {
          items: [
            { id: 'blocks', label: t('stage.view.blocks') },
            { id: 'trace', label: t('stage.view.trace') },
          ],
          value: view,
          onChange: setView,
          ariaLabel: t('stage.view.label'),
          size: 'sm',
        }),
        h('span', { className: 'stage-spacer' }),
        h(ML.Btn, { size: 'sm', onClick: copyStep, disabled: !blocks.length }, t('stage.copyStep')),
        h(
          ML.Btn,
          { size: 'sm', onClick: function () { exportMarkdown(true); }, disabled: exporting },
          t('stage.copyMarkdown'),
        ),
        h(ML.Btn, { size: 'sm', variant: 'primary', onClick: function () { exportMarkdown(false); }, disabled: exporting }, exporting ? t('stage.exporting') : t('stage.export')),
        h(ML.Btn, { size: 'sm', onClick: load }, t('stage.refresh')),
      ),
    );

    const stepStrip =
      view === 'blocks' && stage
        ? h(StepStrip, {
            count: blocks.length,
            index: index,
            t: t,
            label: t('stage.title'),
            onJump: function (target) {
              setStep(target);
            },
          })
        : null;

    let body;
    if (view === 'trace') {
      body = h(TraceView, { trace: doc.trace, t: t, loading: loading, onRefresh: load, onToast: showToast });
    } else if (!hasLoaded) {
      body = loading
        ? h(ML.Loading, { label: t('stage.loading') })
        : error
          ? h(ML.ErrorBox, { error: error, onRetry: load, title: t('stage.error.title'), extra: t('stage.retryHint') })
          : h(ML.Loading, { label: t('stage.loading') });
    } else if (!stage) {
      body = h(StageEmpty, { t: t, trace: doc.trace });
    } else {
      body = h(
        'div',
        { className: 'stage-blocks' },
        error ? h(ML.Banner, { tone: 'warn' }, t('stage.offline')) : null,
        blocks.length === 0
          ? h(StageEmpty, { t: t, trace: doc.trace })
          : blocks.map(function (block, blockIndex) {
              const blockId = blockIdOf(block, blockIndex);
              return h(BlockView, {
                key: blockId,
                block: block,
                blockId: blockId,
                index: blockIndex,
                current: blockIndex === index,
                innerRef: blockIndex === index ? currentRef : undefined,
                annotations: annotationsByBlock.get(blockId) || [],
                sessionId: sessionId,
                symbolUsage: symbolUsage,
                activeSymbol: activeSymbol,
                onSymbolClick: setActiveSymbol,
                onJumpToIndex: jumpToBlock,
                t: t,
                onJump: function (target) {
                  setStep(target);
                },
                onChanged: load,
              });
            }),
        ML.isObj(stage.takeaway) ? h(TakeawayCard, { takeaway: stage.takeaway, t: t }) : null,
        generalAnnotations.length
          ? h(
              'div',
              { className: 'stage-general-notes' },
              h('div', { className: 'stage-caption' }, t('stage.annotation.general')),
              generalAnnotations.map(function (annotation, annotationIndex) {
                const item = ML.isObj(annotation) ? annotation : { note: annotation };
                const text = item.note !== undefined && item.note !== null ? String(item.note) : ML.safeString(item);
                return h(
                  'div',
                  { key: String(item.id || annotationIndex), className: 'stage-annot-item' },
                  h('span', { className: 'stage-annot-mark', 'aria-hidden': true }, '✎'),
                  h('span', { className: 'stage-annot-text' }, text),
                  item.at ? h('time', { className: 'stage-annot-time' }, fmtTime(item.at)) : null,
                );
              }),
            )
          : null,
        h(QuestionBox, {
          stage: stage,
          t: t,
          blockId: currentBlockId,
          currentIndex: index,
          sessionId: sessionId,
          onToast: showToast,
          onChanged: load,
        }),
      );
    }

    const toastNode = toast
      ? h(
          ML.Banner,
          { tone: toast.tone === 'error' ? 'error' : toast.tone === 'warn' ? 'warn' : 'success', className: 'stage-toast' },
          toast.message,
        )
      : null;
    const symbolNode = activeSymbol
      ? h(
          'div',
          { className: 'stage-symbol-focus' },
          h(
            'span',
            { className: 'stage-symbol-focus-label' },
            ML.fmt(t, 'stage.symbol.focusBanner', {
              symbol: activeSymbol,
              steps: (symbolUsage.get(activeSymbol) || [])
                .map(function (i) {
                  return '第 ' + (i + 1) + ' 步';
                })
                .join('、'),
            }),
          ),
          h(
            'button',
            {
              type: 'button',
              className: 'stage-symbol-focus-clear',
              onClick: function () {
                setActiveSymbol(null);
              },
            },
            t('stage.symbol.clearFocus'),
          ),
        )
      : null;
    const zoomBar =
      pinned && view === 'blocks'
        ? h(
            'div',
            { className: 'stage-zoomctl', role: 'group', 'aria-label': t('stage.zoom.label') },
            h('button', { type: 'button', className: 'stage-zoom-btn', onClick: function () { changeZoom(-0.1); }, title: t('stage.zoom.out') }, 'A−'),
            h('span', { className: 'stage-zoom-val' }, Math.round(zoom * 100) + '%'),
            h('button', { type: 'button', className: 'stage-zoom-btn', onClick: function () { changeZoom(0.1); }, title: t('stage.zoom.in') }, 'A+'),
            h('button', { type: 'button', className: 'stage-zoom-btn', onClick: function () { setZoom(1); try { ML.storage.set('stage.zoom', '1'); } catch (storageError) { /* best effort */ } }, title: t('stage.zoom.reset') }, '⟲'),
          )
        : null;
    const top = pinned
      ? h('div', { className: 'stage-pin' }, header, toastNode, symbolNode, stepStrip, zoomBar)
      : h(React.Fragment, null, header, toastNode, symbolNode, stepStrip);

    const askLeft = selectionAsk && typeof window !== 'undefined'
      ? Math.max(12, Math.min(selectionAsk.x - 170, window.innerWidth - 350))
      : 0;
    const askTop = selectionAsk && typeof window !== 'undefined'
      ? Math.max(12, Math.min(selectionAsk.bottom + 8, window.innerHeight - 280))
      : 0;

    return h(
      'div',
      {
        className: 'stage-root' + (embedded ? ' stage-root-embedded' : '') + (pinned ? ' stage-root-pinned' : ''),
        role: 'region',
        'aria-label': t('stage.title'),
        ref: stageRootRef,
        onMouseUp: onStageMouseUp,
      },
      top,
      h(
        'div',
        { className: 'stage-zoom-body' + (pinned ? ' is-pinned' : ''), style: pinned ? { zoom: zoom } : null },
        body,
      ),
      selectionAsk && !askOpen
        ? h(
            'button',
            {
              type: 'button',
              className: 'stage-select-ask',
              style: {
                left: Math.round(Math.max(12, Math.min(selectionAsk.x - 40, (typeof window !== 'undefined' ? window.innerWidth : 1200) - 120))) + 'px',
                top: Math.round(Math.max(8, selectionAsk.y - 42)) + 'px',
              },
              onMouseDown: function (event) {
                event.preventDefault();
                event.stopPropagation();
              },
              onClick: function () {
                setAskOpen(true);
              },
            },
            t('stage.ask.selection'),
          )
        : null,
      selectionAsk && askOpen
        ? h(
            'div',
            {
              className: 'stage-ask-pop',
              ref: askBoxRef,
              style: { left: Math.round(askLeft) + 'px', top: Math.round(askTop) + 'px' },
              role: 'dialog',
              'aria-label': t('stage.ask.title'),
            },
            h('div', { className: 'stage-ask-quote' }, '「' + selectionAsk.text + '」'),
            h('textarea', {
              className: 'stage-ask-input',
              value: askText,
              placeholder: t('stage.ask.placeholder'),
              rows: 3,
              onChange: function (event) {
                setAskText(event.target.value);
              },
              onKeyDown: function (event) {
                if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') submitSelectionQuestion();
              },
            }),
            h(
              'div',
              { className: 'stage-ask-actions' },
              h(
                ML.Btn,
                { size: 'sm', variant: 'primary', onClick: submitSelectionQuestion, disabled: askSaving },
                askSaving ? t('common.loading') : t('stage.ask.submit'),
              ),
              h(
                ML.Btn,
                {
                  size: 'sm',
                  variant: 'ghost',
                  onClick: function () {
                    setAskOpen(false);
                    setSelectionAsk(null);
                  },
                },
                t('stage.ask.cancel'),
              ),
            ),
          )
        : null,
    );
  }

  /* ------------------------------------------------------- conversation dock */

  ML.CSS += `
  .stage-dock { border: 1px solid var(--dsw-alias-border-l1); background: var(--dsw-alias-bg-layer-1); border-radius: 12px; margin: 0 0 8px; overflow: hidden; }
  .stage-dock-bar { display: flex; align-items: center; gap: 8px; padding: 7px 10px; min-height: 34px; }
  .stage-dock-badge { flex: none; font-size: 11px; font-weight: 700; letter-spacing: .04em; color: var(--dsw-alias-brand-primary); background: color-mix(in srgb, var(--dsw-alias-brand-primary) 16%, transparent); border-radius: 999px; padding: 2px 8px; }
  .stage-dock-title { flex: 1 1 auto; min-width: 0; text-align: left; background: none; border: 0; padding: 0; margin: 0; color: inherit; font: inherit; font-weight: 600; cursor: pointer; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .stage-dock-title:hover { text-decoration: underline; }
  .stage-dock-meta { flex: none; font-size: 12px; color: var(--dsw-alias-label-secondary); font-variant-numeric: tabular-nums; }
  .stage-dock-body { border-top: 1px solid var(--dsw-alias-border-l1); max-height: min(62vh, 720px); overflow: auto; padding: 10px; background: var(--dsw-alias-bg-layer-1); }
  .stage-root-embedded { padding: 0; }
  .stage-root-embedded .stage-hd { padding: 4px 0 8px; }
  .stage-root-embedded .stage-hd-text { display: none; }
  .stage-surface-switch { display: inline-flex; flex: none; border: 1px solid var(--dsw-alias-border-l1); border-radius: 8px; overflow: hidden; }
  .stage-surface-btn { appearance: none; border: 0; background: transparent; color: var(--dsw-alias-label-secondary); padding: 2px 8px; font-size: 11px; line-height: 18px; cursor: pointer; }
  .stage-surface-btn:hover { background: var(--dsw-alias-bg-layer-2); color: var(--dsw-alias-label-primary); }
  .stage-surface-btn.is-active { background: var(--dsw-alias-bg-layer-2); color: var(--dsw-alias-label-primary); font-weight: 600; }
  .stage-native-host { height: 100%; min-height: 0; overflow: auto; box-sizing: border-box; padding: 8px 10px 16px; background: var(--dsw-alias-bg-base); }
  .stage-root-pinned { gap: 0; }
  .stage-pin { position: sticky; top: 0; z-index: 3; display: flex; flex-direction: column; gap: 6px; padding: 2px 0 6px; margin-bottom: 8px; background: var(--dsw-alias-bg-base); border-bottom: 1px solid var(--dsw-alias-border-l1); }
  .stage-root-pinned .stage-block { scroll-margin-top: 190px; }
  .stage-zoomctl { display: flex; align-items: center; justify-content: flex-end; gap: 4px; }
  .stage-zoom-btn { appearance: none; cursor: pointer; border: 1px solid var(--dsw-alias-border-l1); background: var(--dsw-alias-bg-layer-2); color: var(--dsw-alias-label-primary); border-radius: 6px; min-width: 26px; height: 22px; padding: 0 6px; font-size: 11px; line-height: 1; }
  .stage-zoom-btn:hover { background: var(--dsw-alias-bg-layer-1); }
  .stage-zoom-val { min-width: 38px; text-align: center; font-size: 11px; color: var(--dsw-alias-label-secondary); font-variant-numeric: tabular-nums; }
  .stage-prefs { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; padding: 6px 10px; margin-bottom: 8px; border: 1px solid var(--dsw-alias-border-l1); border-radius: 10px; background: var(--dsw-alias-bg-layer-2); font-size: 12px; }
  .stage-prefs-title { font-weight: 600; color: var(--dsw-alias-label-primary); }
  .stage-prefs-hint { color: var(--dsw-alias-label-secondary); font-size: 11px; }
  .stage-pref { appearance: none; cursor: pointer; display: inline-flex; align-items: center; gap: 5px; border: 1px solid var(--dsw-alias-border-l1); background: var(--dsw-alias-bg-base); color: var(--dsw-alias-label-secondary); border-radius: 999px; padding: 2px 8px 2px 4px; font-size: 11px; line-height: 18px; }
  .stage-pref-dot { width: 10px; height: 10px; border-radius: 50%; background: var(--dsw-alias-border-l1); transition: background .12s ease; }
  .stage-pref.is-on { color: var(--dsw-alias-label-primary); }
  .stage-pref.is-on .stage-pref-dot { background: var(--dsw-alias-brand-primary); }
  .stage-native-tab-title { display: inline-flex; align-items: center; gap: 5px; }
  .stage-select-ask {
    position: fixed; z-index: 90; appearance: none; cursor: pointer;
    padding: 6px 10px; border-radius: 999px; border: 1px solid var(--dsw-alias-border-l1);
    background: var(--dsw-alias-bg-layer-1); color: var(--dsw-alias-label-primary);
    font-size: 12px; font-weight: 600; box-shadow: 0 6px 18px rgba(0, 0, 0, .18);
  }
  .stage-select-ask:hover { background: var(--dsw-alias-bg-layer-2); }
  .stage-ask-pop {
    position: fixed; z-index: 91; width: 320px; max-width: calc(100vw - 24px);
    padding: 10px; border-radius: 12px; border: 1px solid var(--dsw-alias-border-l1);
    background: var(--dsw-alias-bg-layer-1); box-shadow: 0 16px 44px rgba(0, 0, 0, .24);
    display: flex; flex-direction: column; gap: 8px;
  }
  .stage-ask-quote { font-size: 12px; color: var(--dsw-alias-label-secondary); background: var(--dsw-alias-bg-layer-2); border-radius: 8px; padding: 6px 8px; max-height: 92px; overflow: auto; }
  .stage-ask-input { width: 100%; box-sizing: border-box; resize: vertical; min-height: 72px; border-radius: 8px; border: 1px solid var(--dsw-alias-border-l1); background: var(--dsw-alias-bg-base); color: inherit; padding: 6px 8px; font: inherit; font-size: 13px; }
  .stage-ask-actions { display: flex; justify-content: flex-end; gap: 6px; }
  .stage-symbol-focus { display: flex; align-items: center; gap: 8px; padding: 6px 10px; border-radius: 10px; background: var(--dsw-alias-bg-layer-2); border: 1px solid var(--dsw-alias-border-l1); font-size: 12px; }
  .stage-symbol-focus-label { flex: 1 1 auto; color: var(--dsw-alias-label-secondary); }
  .stage-symbol-focus-clear { appearance: none; border: 0; background: transparent; color: var(--dsw-alias-brand-primary); cursor: pointer; font-size: 12px; }
  .stage-block.is-symbol-focus { box-shadow: 0 0 0 2px color-mix(in srgb, var(--dsw-alias-brand-primary) 30%, transparent); border-radius: 10px; }
  .stage-chip.is-active { border-color: var(--dsw-alias-brand-primary); background: color-mix(in srgb, var(--dsw-alias-brand-primary) 14%, transparent); }
  .stage-sym-graph { margin-top: 8px; border-top: 1px solid var(--dsw-alias-border-l1); padding-top: 8px; }
  .stage-sym-graph-line { stroke: var(--dsw-alias-border-l1); stroke-width: 1; opacity: .65; }
  .stage-sym-graph-line.is-active { stroke: var(--dsw-alias-brand-primary); stroke-width: 1.6; opacity: 1; }
  .stage-sym-graph-dot { fill: var(--dsw-alias-label-secondary); }
  .stage-sym-graph-dot.is-active { fill: var(--dsw-alias-brand-primary); }
  .stage-sym-graph-label { fill: var(--dsw-alias-label-primary); font-size: 11px; cursor: pointer; }
  .stage-sym-graph-label.is-active { fill: var(--dsw-alias-brand-primary); font-weight: 600; }
  .stage-sym-graph-step { fill: var(--dsw-alias-brand-primary); font-size: 10px; cursor: pointer; }
  `;

  function StageDock(props) {
    const t = ML.useT();
    const prefs = ML.useStagePrefs();
    const sessionId = typeof props.sessionId === 'string' && props.sessionId !== '' ? props.sessionId : undefined;
    const [doc, setDoc] = useState({ stage: null, revision: null });
    const [surface, setSurface] = useState(function () {
      try {
        const stored = ML.storage.get('stage.surface', 'right');
        return stored === 'inline' || stored === 'off' ? stored : 'right';
      } catch (storageError) {
        return 'right';
      }
    });
    const aliveRef = useRef(true);
    const bodyRef = useRef(null);
    const lastStageIdRef = useRef(null);

    useEffect(function () {
      aliveRef.current = true;
      return function () {
        aliveRef.current = false;
      };
    }, []);

    useEffect(
      function () {
        if (!sessionId) return undefined;
        let alive = true;
        let timer = null;
        const tick = function () {
          if (!alive) return;
          ML.callMath('stage.get', { sessionId: sessionId })
            .then(function (payload) {
              if (!alive) return;
              const normalized = normalizeStagePayload(payload);
              setDoc({ stage: normalized.stage, revision: normalized.revision });
            })
            .catch(function () {
              /* dock hides itself rather than blocking the composer */
            })
            .then(function () {
              if (alive) timer = setTimeout(tick, 2000);
            });
        };
        tick();
        return function () {
          alive = false;
          clearTimeout(timer);
        };
      },
      [sessionId],
    );

    useStageStream(sessionId, function () {
      if (!sessionId) return;
      ML.callMath('stage.get', { sessionId: sessionId })
        .then(function (payload) {
          if (!aliveRef.current) return;
          const normalized = normalizeStagePayload(payload);
          setDoc({ stage: normalized.stage, revision: normalized.revision });
        })
        .catch(function () {
          /* polling remains */
        });
    });

    const stage = doc.stage;
    const blocks = ML.toArr(stage && stage.blocks);
    const stageId = stage && typeof stage.id === 'string' ? stage.id : null;

    const applySurface = function (next) {
      if (next === 'right' && !prefs.right) return;
      setSurface(next);
      try {
        ML.storage.set('stage.surface', next);
      } catch (storageError) {
        /* preference is a convenience */
      }
      if (next === 'right') {
        if (typeof ML.openStageRight !== 'function' || !ML.openStageRight()) {
          setSurface('inline');
          try {
            ML.storage.set('stage.surface', 'inline');
          } catch (storageError) {
            /* preference is a convenience */
          }
        }
      } else if (typeof ML.collapseStageRight === 'function') {
        ML.collapseStageRight();
      }
    };

    useEffect(
      function () {
        if (!prefs.right && surface === 'right') {
          setSurface('inline');
          try {
            ML.storage.set('stage.surface', 'inline');
          } catch (storageError) {
            /* preference is a convenience */
          }
        }
      },
      [prefs.right, surface],
    );

    useEffect(
      function () {
        if (!stageId) {
          lastStageIdRef.current = null;
          return;
        }
        if (stageId !== lastStageIdRef.current) {
          lastStageIdRef.current = stageId;
          if (prefs.right && surface === 'right' && stage.autoShow !== false && typeof ML.openStageRight === 'function') ML.openStageRight();
        }
      },
      [stageId, surface, stage, prefs.right],
    );

    useEffect(
      function () {
        if (bodyRef.current) bodyRef.current.scrollTop = 0;
      },
      [stageId],
    );

    if (!prefs.inline) return null;
    if (!stage || blocks.length === 0) return null;
    const revision = doc.revision !== null ? doc.revision : stage.revision;
    const focus = Number.isFinite(Number(stage.focus)) ? Math.max(0, Math.min(Number(stage.focus), blocks.length - 1)) : 0;
    const inlineOpen = surface === 'inline';
    const surfaces = [['inline', t('stage.surface.inline')], ['off', t('stage.surface.off')]];
    if (prefs.right) surfaces.unshift(['right', t('stage.surface.right')]);
    return h(
      'div',
      { className: 'stage-dock' + (inlineOpen ? ' is-open' : ''), 'data-mathlab-stage-dock': '' },
      h(
        'div',
        { className: 'stage-dock-bar' },
        h('span', { className: 'stage-dock-badge' }, t('stage.title')),
        h(
          'button',
          {
            type: 'button',
            className: 'stage-dock-title',
            onClick: function () {
              applySurface('right');
            },
            title: t('stage.right.open'),
          },
          stage.title || t('stage.untitled'),
        ),
        h('span', { className: 'stage-dock-meta' }, ML.fmt(t, 'stage.dockMeta', { current: focus + 1, total: blocks.length, revision: revision })),
        h(
          'div',
          { className: 'stage-surface-switch', role: 'group', 'aria-label': t('stage.surface.label') },
          surfaces.map(function (item) {
            return h(
              'button',
              {
                key: item[0],
                type: 'button',
                className: 'stage-surface-btn' + (surface === item[0] ? ' is-active' : ''),
                'aria-pressed': surface === item[0] ? 'true' : 'false',
                onClick: function () {
                  applySurface(item[0]);
                },
              },
              item[1],
            );
          }),
        ),
      ),
      inlineOpen
        ? h(
            'div',
            { className: 'stage-dock-body', ref: bodyRef },
            h(StageTab, { sessionId: sessionId, embedded: true, pinned: true, active: true, scrollRootRef: bodyRef }),
          )
        : null,
    );
  }

  /* ------------------------------------------------------- plugin settings */

  function StagePrefsBar(props) {
    const t = tr(props.t);
    const prefs = ML.useStagePrefs();
    const toggle = function (key, label) {
      const on = !!prefs[key];
      return h(
        'button',
        {
          type: 'button',
          role: 'switch',
          'aria-checked': on ? 'true' : 'false',
          className: 'stage-pref' + (on ? ' is-on' : ''),
          onClick: function () {
            ML.stagePrefs.set(key, !on);
          },
        },
        h('span', { className: 'stage-pref-dot', 'aria-hidden': true }),
        h('span', null, label),
      );
    };
    return h(
      'div',
      { className: 'stage-prefs' },
      h('span', { className: 'stage-prefs-title' }, t('stage.prefs.title')),
      toggle('inline', t('stage.prefs.inline')),
      toggle('right', t('stage.prefs.right')),
      h('span', { className: 'stage-prefs-hint' }, t('stage.prefs.hint')),
    );
  }

  ML.StageTabWithPrefs = function (props) {
    return h(React.Fragment, null, h(StagePrefsBar, { t: props.t }), h(StageTab, props));
  };

  /* ------------------------------------------------------------- registration */

  ML.assignStrings(
    {
      'stage.untitled': '（未命名讲解）',
      'stage.dockMeta': '第 {current}/{total} 步 · rev {revision}',
      'stage.surface.label': '讲解显示位置',
      'stage.surface.right': '右侧',
      'stage.surface.inline': '内嵌',
      'stage.surface.off': '关闭',
      'stage.right.open': '在右侧打开讲解',
      'stage.native.title': '讲解',
      'stage.native.desc': 'MathLab 讲解舞台：判断、证明、符号连接与交互图像',
      'stage.symbol.focusHint': '点击高亮使用该符号的步骤（双击复制）',
      'stage.symbol.focusBanner': '符号 {symbol} 出现在 {steps}；已高亮相关判断。',
      'stage.symbol.clearFocus': '取消高亮',
      'stage.symbols.graph': '符号—步骤连接图',
      'stage.ask.selection': '划词提问',
      'stage.ask.title': '针对选中文字提问',
      'stage.ask.placeholder': '关于这段话，你想问什么？',
      'stage.ask.submit': '记录并发送到对话',
      'stage.ask.cancel': '取消',
      'stage.ask.empty': '请先输入问题',
      'stage.ask.sent': '已记录问题，并放入对话输入框',
      'stage.ask.saved': '已记录问题并复制；粘贴到对话即可发送',
      'stage.ask.savedNoCopy': '已记录问题；复制失败，请手动输入到对话',
      'stage.zoom.label': '内容缩放',
      'stage.zoom.in': '放大',
      'stage.zoom.out': '缩小',
      'stage.zoom.reset': '重置缩放',
      'stage.prefs.title': '插件选项 · 讲解舞台',
      'stage.prefs.inline': '下侧栏',
      'stage.prefs.right': '右侧栏',
      'stage.prefs.hint': '可独立开关；关掉一侧不影响另一侧',
    },
    {
      'stage.untitled': '(untitled stage)',
      'stage.dockMeta': 'step {current}/{total} · rev {revision}',
      'stage.surface.label': 'Stage placement',
      'stage.surface.right': 'Right',
      'stage.surface.inline': 'Inline',
      'stage.surface.off': 'Off',
      'stage.right.open': 'Open the stage in the right sidebar',
      'stage.native.title': 'Stage',
      'stage.native.desc': 'MathLab Live Stage: judgments, proofs, symbol links and interactive figures',
      'stage.symbol.focusHint': 'Click to highlight the steps using this symbol (double-click copies)',
      'stage.symbol.focusBanner': 'Symbol {symbol} appears in {steps}; related judgments are highlighted.',
      'stage.symbol.clearFocus': 'Clear highlight',
      'stage.symbols.graph': 'Symbol–step connection graph',
      'stage.ask.selection': 'Ask about selection',
      'stage.ask.title': 'Ask about the selected text',
      'stage.ask.placeholder': 'What would you like to ask about this passage?',
      'stage.ask.submit': 'Record & send to chat',
      'stage.ask.cancel': 'Cancel',
      'stage.ask.empty': 'Type a question first',
      'stage.ask.sent': 'Question recorded and placed in the chat composer',
      'stage.ask.saved': 'Question recorded and copied — paste it into the chat',
      'stage.ask.savedNoCopy': 'Question recorded; copy failed, type it in the chat',
      'stage.zoom.label': 'Content zoom',
      'stage.zoom.in': 'Zoom in',
      'stage.zoom.out': 'Zoom out',
      'stage.zoom.reset': 'Reset zoom',
      'stage.prefs.title': 'Plugin options · Stage',
      'stage.prefs.inline': 'Bottom dock',
      'stage.prefs.right': 'Right sidebar',
      'stage.prefs.hint': 'Independent toggles; turning one off leaves the other',
    },
  );

  ML.StageDock = StageDock;
  ML.StageTab = StageTab;
  ML.tabs.stage = { id: 'stage', order: 5, Component: StageTab };
})();
