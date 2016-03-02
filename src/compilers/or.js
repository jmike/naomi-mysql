import _ from 'lodash';
import CustomError from 'customerror';
import compileSelection from './selection';

/**
 * Compiles and returns a parameterized SQL "or" expression, based on the supplied AST.
 * @param {Array} ast abstract syntax tree, as given by the QueryParser.
 * @return {Object}
 */
function compile(ast: Array): Object {
  if (ast[0] !== 'OR') {
    throw new CustomError(`Invalid abstract syntax tree; expected "OR", received ${ast[0]}`, 'QueryCompileException');
  }

  const sql = [];
  let params = [];

  _.tail(ast).forEach((e) => {
    const expr = compileSelection(['SELECTION', e]);
    sql.push('(' + expr.sql + ')');
    params = params.concat(expr.params);
  });

  return {params, sql: sql.join(' OR ')};
}

export default compile;
