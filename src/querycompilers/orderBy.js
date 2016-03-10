import _ from 'lodash';
import CustomError from 'customerror';
import compileKey from './key';

/**
 * Compiles and returns a parameterized SQL "order by" clause, based on the supplied AST.
 * @param {Array} ast abstract syntax tree, as given by the QueryParser.
 * @return {Object}
 */
function compile(ast: Array): Object {
  const sql = [];
  let params = [];

  if (ast[0] !== 'ORDERBY') {
    throw new CustomError(`Invalid abstract syntax tree; expected "ORDERBY", received ${ast[0]}`, 'QueryCompileException');
  }

  if (!_.isNil(ast[1])) {
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
        throw new CustomError(`Invalid abstract syntax tree; expected "ASC" or "DESC", received ${ast[0]}`, 'QueryCompileException');
      }
    });
  }

  return {params, sql: sql.join(', ')};
}

export default compile;
