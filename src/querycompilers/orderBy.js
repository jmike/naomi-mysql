import _ from 'lodash';
import type from 'type-of';
import compileKey from './key';

/**
 * Compiles and returns a parameterized SQL "order by" clause, based on the supplied AST.
 * @param {Array} ast abstract syntax tree, as given by the QueryParser.
 * @return {Object}
 */
function compile(ast) {
  // make sure ast is array
  if (!_.isArray(ast)) {
    throw new TypeError(`Invalid "ast" argument; expected array, received ${type(ast)}`);
  }

  // make sure ast function is "ORDERBY"
  if (ast[0] !== 'ORDERBY') {
    throw new TypeError(`Invalid "ast" argument; expected "ORDERBY" at position 0, received "${ast[0]}"`);
  }

  // handle nil ast argument
  if (_.isNil(ast[1])) {
    return { sql: '', params: [] };
  }

  const sql = [];
  let params = [];

  _.tail(ast).forEach((arr, i) => {
    if (arr[0] === 'DESC') {
      const key = compileKey(arr[1]);
      sql.push(`${key.sql} DESC`);
      params = params.concat(key.params);
    } else if (arr[0] === 'ASC') {
      const key = compileKey(arr[1]);
      sql.push(`${key.sql} ASC`);
      params = params.concat(key.params);
    } else {
      throw new TypeError(`Invalid "ast" argument; expected "ASC" or "DESC" at position ${i}:0, received "${ast[0]}"`);
    }
  });

  return { params, sql: sql.join(', ') };
}

export default compile;
