import _ from 'lodash';
import CustomError from 'customerror';
import compileKey from './key';

/**
 * Compiles and returns a parameterized SQL "order by" clause, based on the supplied AST.
 * @param {Array} ast abstract syntax tree, as given by the QueryParser.
 * @return {Object}
 */
function compile(ast: Array): Object {
  // make sure AST function is valid
  if (ast[0] !== 'ORDERBY') {
    throw new TypeError(`Invalid AST; expected "ORDERBY", received "${ast[0]}"`);
  }

  // handle null argument
  if (_.isNil(ast[1])) {
    return {sql: '', params: []};
  }

  const sql = [];
  let params = [];

  _.tail(ast).forEach((arr) => {
    if (arr[0] === 'DESC') {
      const key = compileKey(arr[1]);
      sql.push(`${key.sql} DESC`);
      params = params.concat(key.params);
    } else if (arr[0] === 'ASC') {
      const key = compileKey(arr[1]);
      sql.push(`${key.sql} ASC`);
      params = params.concat(key.params);
    } else {
      throw new TypeError(`Invalid AST; expected "ASC" or "DESC", received "${ast[0]}"`);
    }
  });

  return {params, sql: sql.join(', ')};
}

export default compile;
