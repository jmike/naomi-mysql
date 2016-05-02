import _ from 'lodash';
import type from 'type-of';

/**
 * Compiles and returns a parameterized SQL "offset" expression, based on the supplied AST.
 * @param {Array} ast abstract syntax tree, as given by the QueryParser.
 * @return {Object}
 */
function compile(ast) {
  // make sure ast is array
  if (!_.isArray(ast)) {
    throw new TypeError(`Invalid "ast" argument; expected array, received ${type(ast)}`);
  }

  // make sure ast function is "OFFSET"
  if (ast[0] !== 'OFFSET') {
    throw new TypeError(`Invalid "ast" argument; expected "OFFSET" at position 0, received ${ast[0]}`);
  }

  // handle null or undefined  ast argument
  if (_.isNil(ast[1])) {
    return { sql: '', params: [] };
  }

  // make sure ast argument is integer
  if (!_.isInteger(ast[1])) {
    throw new TypeError(`Invalid "ast" argument; expected integer at position 1, received ${type(ast[1])}`);
  }

  return { sql: ast[1].toString(), params: [] };
}

export default compile;
