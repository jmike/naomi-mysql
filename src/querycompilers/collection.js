import _ from 'lodash';
import type from 'type-of';
import compileKey from './key';

/**
 * Compiles and returns a parameterized SQL "from" expression, based on the supplied AST.
 * @param {Array} ast abstract syntax tree.
 * @return {Object}
 */
function compile(ast) {
  // make sure ast is array
  if (!_.isArray(ast)) {
    throw new TypeError(`Invalid "ast" argument; expected array, received ${type(ast)}`);
  }

  // make sure ast function is valid
  if (ast[0] !== 'COLLECTION') {
    throw new TypeError(`Invalid "ast" argument; expected "COLLECTION" at position 0, received "${ast[0]}"`);
  }

  return compileKey(ast[1]);
}

export default compile;
