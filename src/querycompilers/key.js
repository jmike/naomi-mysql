import _ from 'lodash';
import type from 'type-of';
import escapeIdentifier from './escape';

/**
 * Compiles and returns a parameterized SQL "key" expression, based on the supplied AST.
 * @param {Array} ast abstract syntax tree, as given by the QueryParser.
 * @return {Object}
 */
function compile(ast: Array): Object {
  // make sure AST function is valid
  if (ast[0] !== 'KEY') {
    throw new TypeError(`Invalid AST function; expected "KEY", received "${ast[0]}"`);
  }

  // handle null or undefined argument
  if (!_.isString(ast[1])) {
    throw new TypeError(`Invalid AST argument; expected string, received ${type(ast[1])}`);
  }

  const sql = escapeIdentifier(ast[1]);
  const params = [];

  return {sql, params};
}

export default compile;
