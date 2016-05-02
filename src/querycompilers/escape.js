import _ from 'lodash';
import type from 'type-of';

/**
 * Escapes and returns the supplied identifier.
 * @param {string} identifier
 * @return {string}
 */
function escapeIdentifier(identifier) {
  // make sure identifier is string
  if (!_.isString(identifier)) {
    throw new TypeError(`Invalid "identifier" argument; expected string, received ${type(identifier)}`);
  }

  return `\`${identifier}\``;
}

export default escapeIdentifier;
