/**
 * Read-only content catalog: symbols, examples and Lean snippets from `data/`.
 * Files are loaded lazily and cached; a missing or malformed file degrades to an
 * empty catalog instead of breaking the plugin.
 */
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const DATA_DIR = fileURLToPath(new URL('../data/', import.meta.url));

function dataPath(name) {
  return new URL(`../data/${name}`, import.meta.url);
}

/** @param {unknown} value @returns {string} */
function lower(value) {
  return typeof value === 'string' ? value.toLowerCase() : '';
}

export class ContentCatalog {
  constructor() {
    /** @type {Promise<{fields: any[], symbols: any[]}> | undefined} */
    this.symbolsPromise = undefined;
    /** @type {Promise<any[]> | undefined} */
    this.examplesPromise = undefined;
    /** @type {Promise<any[]> | undefined} */
    this.snippetsPromise = undefined;
    this.warnings = [];
  }

  async #read(name, key) {
    try {
      const text = await readFile(dataPath(name), 'utf8');
      const parsed = JSON.parse(text);
      const value = parsed?.[key];
      if (!Array.isArray(value)) {
        this.warnings.push(`${name}: missing array "${key}"`);
        return [];
      }
      return value;
    } catch (error) {
      if (error?.code !== 'ENOENT') this.warnings.push(`${name}: ${error instanceof Error ? error.message : String(error)}`);
      return [];
    }
  }

  /** @returns {Promise<{fields: any[], symbols: any[]}>} */
  async symbols() {
    this.symbolsPromise ??= (async () => {
      const exact = await readFile(dataPath('symbols.json'), 'utf8').then((text) => JSON.parse(text)).catch((error) => {
        if (error?.code !== 'ENOENT') this.warnings.push(`symbols.json: ${error.message}`);
        return {};
      });
      return {
        fields: Array.isArray(exact?.fields) ? exact.fields : [],
        symbols: Array.isArray(exact?.symbols) ? exact.symbols : [],
      };
    })();
    return this.symbolsPromise;
  }

  async examples() {
    this.examplesPromise ??= this.#read('examples.json', 'examples');
    return this.examplesPromise;
  }

  async snippets() {
    this.snippetsPromise ??= this.#read('lean-snippets.json', 'snippets');
    return this.snippetsPromise;
  }

  async listSymbols({ field } = {}) {
    const { fields, symbols } = await this.symbols();
    const filtered = field ? symbols.filter((entry) => entry?.field === field) : symbols.slice();
    return { fields, symbols: filtered };
  }

  async searchSymbols({ query = '', field, limit = 50 } = {}) {
    const { symbols } = await this.symbols();
    const q = lower(query).trim();
    const terms = q === '' ? [] : q.split(/\s+/);
    const filtered = symbols.filter((entry) => {
      if (field && entry?.field !== field) return false;
      if (terms.length === 0) return true;
      const haystack = [
        lower(entry?.name), lower(entry?.name_zh), lower(entry?.symbol), lower(entry?.latex),
        lower(entry?.unicode), lower(entry?.description), lower(entry?.description_zh),
        lower(entry?.lean), lower(entry?.sympy), lower(Array.isArray(entry?.tags) ? entry.tags.join(' ') : ''),
      ].join(' ');
      return terms.every((term) => haystack.includes(term));
    });
    const max = Math.max(1, Math.min(Number(limit) || 50, 200));
    return { symbols: filtered.slice(0, max), total: filtered.length };
  }

  async listExamples() {
    return { examples: await this.examples() };
  }

  async getExample(id) {
    const examples = await this.examples();
    const example = examples.find((entry) => entry?.id === id);
    return example === undefined ? undefined : { example };
  }

  async listSnippets({ level, query = '' } = {}) {
    const snippets = await this.snippets();
    const q = lower(query).trim();
    const filtered = snippets.filter((entry) => {
      if (level && entry?.level !== level) return false;
      if (q === '') return true;
      return [lower(entry?.title), lower(entry?.title_zh), lower(entry?.code), lower(entry?.explanation),
        lower(entry?.explanation_zh), lower(Array.isArray(entry?.tags) ? entry.tags.join(' ') : '')]
        .join(' ').includes(q);
    });
    return { snippets: filtered, total: filtered.length };
  }

  async getSnippet(id) {
    const snippets = await this.snippets();
    const snippet = snippets.find((entry) => entry?.id === id);
    return snippet === undefined ? undefined : { snippet };
  }

  /** Counts for the meta.info payload. */
  async counts() {
    const [{ symbols, fields }, examples, snippets] = await Promise.all([
      this.symbols(), this.examples(), this.snippets(),
    ]);
    return { symbols: symbols.length, symbolFields: fields.length, examples: examples.length, leanSnippets: snippets.length };
  }
}
