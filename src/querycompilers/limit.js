import _ from 'lodash';
import type from 'type-of';

/**
 * Compiles and returns a parameterized SQL "limit" expression, based on the supplied AST.
 * @param {Array} ast abstract syntax tree, as given by the QueryParser.
 * @return {Object}
 */
function compile(ast: Array): Object {
  // make sure AST function is valid
  if (ast[0] !== 'LIMIT') {
    throw new TypeError(`Invalid AST function; expected "LIMIT", received "${ast[0]}"`);
  }

  // handle null or undefined argument
  if (_.isNil(ast[1])) {
    return {sql: '', params: []};
  }

  // make sure argument is integer
  if (!_.isInteger(ast[1])) {
    throw new TypeError(`Invalid AST argument; expected integer, received ${type(ast[1])}`);
  }

  return {sql: ast[1].toString(), params: []};
}

export default compile;
