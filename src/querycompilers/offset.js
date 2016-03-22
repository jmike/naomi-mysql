import _ from 'lodash';
import type from 'type-of';

/**
 * Compiles and returns a parameterized SQL "offset" expression, based on the supplied AST.
 * @param {Array} ast abstract syntax tree, as given by the QueryParser.
 * @return {Object}
 */
function compile(ast: Array): Object {
  if (ast[0] !== 'OFFSET') {
    throw new TypeError(`Invalid AST function; expected "OFFSET", received ${ast[0]}`);
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
