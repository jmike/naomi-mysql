import _ from 'lodash';
import CustomError from 'customerror';

/**
 * Compiles and returns a parameterized SQL "values" expression, based on the supplied AST.
 * @param {Array} ast abstract syntax tree, as given by the QueryParser.
 * @return {Object}
 */
function compile(ast: Array): Object {
  if (ast[0] !== 'VALUES') {
    throw new CustomError(`Invalid abstract syntax tree; expected "VALUES", received ${ast[0]}`, 'QueryCompileException');
  }

  const sql = [];
  const params = [];

  _.tail(ast).forEach((e) => {
    sql.push('?');
    params.push(e);
  });

  return {params, sql: '(' + sql.join(', ') + ')'};
}

export default compile;
