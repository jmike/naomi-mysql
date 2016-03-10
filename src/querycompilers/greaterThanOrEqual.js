import CustomError from 'customerror';
import compileKey from './key';
import compileValue from './value';

/**
 * Compiles and returns a parameterized SQL "greater than or equal" expression, based on the supplied AST.
 * @param {Array} ast abstract syntax tree, as given by the QueryParser.
 * @return {Object}
 */
function compile(ast: Array): Object {
  if (ast[0] !== 'GTE') {
    throw new CustomError(`Invalid abstract syntax tree; expected "GTE", received ${ast[0]}`, 'QueryCompileException');
  }

  const key = compileKey(ast[1]);
  const value = compileValue(ast[2]);

  const sql = [key.sql];
  let params = key.params;

  sql.push('>=', value.sql);
  params = params.concat(value.params);

  return {params, sql: sql.join(' ')};
}

export default compile;
