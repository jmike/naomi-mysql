import _ from 'lodash';
import type from 'type-of';
import escapeIdentifier from './escape';

/**
 * Compiles and returns a parameterized SQL "key" expression, based on the supplied AST.
 * @param {Array} ast abstract syntax tree, as given by the QueryParser.
 * @return {Object}
 */
function compile(ast) {
  // make sure ast is array
  if (!_.isArray(ast)) {
    throw new TypeError(`Invalid "ast" argument; expected array, received ${type(ast)}`);
  }

  // make sure ast function is valid
  if (ast[0] !== 'KEY') {
    throw new TypeError(`Invalid "ast" argument; expected "KEY" at position 0, received "${ast[0]}"`);
  }

  // handle null or undefined argument
  if (!_.isString(ast[1])) {
    throw new TypeError(`Invalid "ast" argument; expected string at position 1, received ${type(ast[1])}`);
  }

  const sql = escapeIdentifier(ast[1]);
  const params = [];

  return { sql, params };
}

export default compile;
