/**
 * Local tool-definition helper.
 *
 * The plugin is installed as a linked workspace directory, so it cannot import
 * `@deepseek-ai/dsh-tools` (that package resolves only from the dsh installation).
 * The registry only requires a plain definition object:
 *
 *   { name, description, parameters: <JSON Schema>, output: { schema, render }, execute }
 *
 * This module builds exactly that shape, keeping every tool declaration in this
 * plugin dependency-free while remaining a normal registry definition.
 */

/** Default model-facing output shape: one text block plus an optional JSON payload. */
const DEFAULT_OUTPUT_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    text: { type: 'string' },
    data: { type: 'string' },
  },
  required: ['text'],
};

/**
 * Convert the compact per-argument map into the object JSON Schema the model sees.
 * @param parameters - `{ key: { schema, required?, description? } }`.
 * @returns object-rooted parameter schema.
 */
function parametersToSchema(parameters = {}) {
  const properties = {};
  const required = [];
  for (const [key, spec] of Object.entries(parameters)) {
    properties[key] = spec.schema ?? spec;
    if (spec.description !== undefined && properties[key].description === undefined) {
      properties[key].description = spec.description;
    }
    if (spec.required === true) required.push(key);
  }
  const schema = { type: 'object', properties, additionalProperties: false };
  if (required.length > 0) schema.required = required;
  return schema;
}

/**
 * Build one registry-ready tool definition without importing the harness package.
 * @param options - name, description, parameters, outputSchema, execute, render, timeoutMs.
 * @returns plain tool definition accepted by `ctx.tools.register`.
 */
export function defineHostTool(options) {
  const outputSchema = options.outputSchema ?? DEFAULT_OUTPUT_SCHEMA;
  const render = options.render ?? ((_args, value) => {
    const parts = [];
    if (typeof value?.text === 'string' && value.text.trim() !== '') parts.push(value.text);
    if (typeof value?.data === 'string' && value.data.trim() !== '') {
      parts.push('```json', value.data, '```');
    }
    return [{ type: 'text', text: parts.length > 0 ? parts.join('\n') : '(no output)' }];
  });
  return {
    name: options.name,
    description: options.description,
    parameters: parametersToSchema(options.parameters),
    output: { schema: outputSchema, render },
    ...(options.timeoutMs !== undefined ? { timeoutMs: options.timeoutMs } : {}),
    async execute(args, exec) {
      const result = await options.execute(args ?? {}, exec);
      if (typeof result === 'string') return { text: result };
      const text = result?.text ?? '';
      if (result?.data === undefined) return { text };
      return { text, data: typeof result.data === 'string' ? result.data : JSON.stringify(result.data) };
    },
  };
}
