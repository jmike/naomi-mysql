import _ from 'lodash';
import CustomError from 'customerror';
import compileSelection from './selection';

/**
 * Compiles and returns a parameterized SQL "and" expression, based on the supplied AST.
 * @param {Array} ast abstract syntax tree, as given by the QueryParser.
 * @return {Object}
 */
function compile(ast: Array): Object {
  if (ast[0] !== 'AND') {
    throw new CustomError(`Invalid abstract syntax tree; expected "AND", received ${ast[0]}`, 'QueryCompileException');
  }

  const sql = [];
  let params = [];

  _.tail(ast).forEach((e) => {
    const expr = compileSelection(['SELECTION', e]);
    sql.push('(' + expr.sql + ')');
    params = params.concat(expr.params);
  });

  return {params, sql: sql.join(' AND ')};
}

export default compile;
