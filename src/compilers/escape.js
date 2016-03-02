/**
 * Escapes and returns the supplied identifier.
 * @param {string} identifier
 * @return {string}
 */
function escapeIdentifier(identifier: string): string {
  return `\`${identifier}\``;
}

export default escapeIdentifier;
