/* 64-stage-tab — StageTab: the Live Stage reading pane and its styles/i18n.
 *
 * Uses the store/render/transport modules; the dock and registration live in
 * 65-stage-dock.js. */
(function () {
  'use strict';

  const useState = React.useState;
  const useEffect = React.useEffect;
  const useRef = React.useRef;
  const useMemo = React.useMemo;
  const useCallback = React.useCallback;
  const tr = ML.stageStore.tr;
  const clampIndex = ML.stageStore.clampIndex;
  const fmtTime = ML.stageStore.fmtTime;
  const slugify = ML.stageStore.slugify;
  const blockIdOf = ML.stageStore.blockIdOf;
  const normalizeStagePayload = ML.stageStore.normalizeStagePayload;
  const blockLatex = ML.stageStore.blockLatex;
  const buildStageMarkdown = ML.stageStore.buildStageMarkdown;
  const StepStrip = ML.stageRender.StepStrip;
  const TraceView = ML.stageRender.TraceView;
  const StageEmpty = ML.stageRender.StageEmpty;
  const QuestionBox = ML.stageRender.QuestionBox;
  const BlockView = ML.stageRender.BlockView;
  const useStageStream = ML.stageTransport.useStageStream;

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


  ML.StageTab = StageTab;
})();
