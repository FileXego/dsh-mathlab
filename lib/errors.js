/** Typed MathLab operation error shared by the service, stage store and tools. */
export class MathLabError extends Error {
  /**
   * @param {string} code
   * @param {string} message
   */
  constructor(code, message) {
    super(message);
    this.name = 'MathLabError';
    this.code = code;
  }
}
