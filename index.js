/**
 * MathLab — a graduate-level mathematics workbench for DeepSeek Harness.
 *
 * Host half: one MathLabService (Python SymPy engine + local content catalog),
 * exposed twice — as an authenticated HTTP JSON API for the Web panel and as
 * agent tools.
 * The Web client half lives in client.js; display metadata in locale/icon.
 *
 * No harness package imports on purpose: a linked workspace bundle resolves only
 * Node builtins from its own directory, and the tool registry accepts plain
 * definitions (lib/define-tool.js documents the exact shape).
 */
import { MathLabService } from './lib/math-service.js';
import { registerHttpApi } from './lib/http-api.js';
import { registerTools } from './lib/tools.js';

export const name = 'mathlab';

/**
 * Only the tool registry is a hard dependency. The HTTP surface rides the
 * host's authenticated `connection.fetch` channel and is registered lazily;
 * if that channel is unavailable the routes are absent (default deny) while
 * the agent tools and the global panel still work.
 */
export const inject = ['tools'];

const VERSION = '0.2.1';

const STAGE_GUIDE = `MathLab is mounted (tools mathlab, mathlab_plot, mathlab_lean, mathlab_reference, mathlab_status, mathlab_stage; panel tab 数学研究台).

When you explain or teach mathematics in a conversation (a proof, a derivation, a construction, a worked example, a counterexample), use the MathLab Live Stage as the teaching surface instead of answering with prose alone:
1. Call mathlab_stage with action "get" first: it returns the learner's annotations/questions and the step they are viewing.
2. Present a stage with action "present": a title/subtitle, a "strategy" block for the plan, one "judgment" block per explicit reasoning step (verdict goal|assume|have|rule|check|contradiction|conclusion with the rule and reason), "math" blocks for the formulas, a "proof" block for formal derivations, "plot"/"diagram" blocks for the reproducible picture, "symbols" for the logical notation, and a final "takeaway" block for the generalizable/public value.
3. Keep the chat reply short and point at the stage ("看第 3 步"); use action "update" with focus to move the live cursor while you narrate, and "append" for incremental steps.
4. Every mathlab / mathlab_plot / mathlab_lean call is automatically appended to the stage trace, so the learner can audit the raw computation.
5. Finish by calling action "export" (or inviting the learner to press 导出) to produce shareable Markdown.

Do this by default for substantive mathematical teaching. Use text-only answers only when the user explicitly wants a quick reply, the panel is unavailable, or the topic is not mathematical.`;

/**
 * Mount the MathLab service, its HTTP routes and its agent tools.
 * @param {import('@deepseek-ai/cordis').Context} ctx
 */
export function apply(ctx) {
  const service = new MathLabService({
    version: VERSION,
    pythonPath: process.env.MATHLAB_PYTHON,
    engineTimeoutMs: 30_000,
    logger: ctx.logger,
  });

  ctx.effect(() => {
    const disposeTools = registerTools(ctx, service);
    return () => {
      disposeTools();
      service.stop();
    };
  }, 'mathlab: service');

  ctx.inject(['connection'], (sctx) => {
    sctx.effect(() => registerHttpApi(sctx, service), 'mathlab: authenticated HTTP');
  });

  ctx.inject(['systemPrompt'], (sctx) => {
    sctx.systemPrompt.section({
      name: 'mathlab-teaching',
      order: 820,
      text: STAGE_GUIDE,
    });
  });

  ctx.logger?.info?.('mathlab: mounted (engine lazy, tools + authenticated /api/mathlab + live stage)');
}
