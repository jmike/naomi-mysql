import CustomError from 'customerror';
import compileKey from './key';
import compileValues from './values';

/**
 * Compiles and returns a parameterized SQL "not in" expression, based on the supplied AST.
 * @param {Array} ast abstract syntax tree, as given by the QueryParser.
 * @return {Object}
 */
function compile(ast: Array): Object {
  if (ast[0] !== 'NIN') {
    throw new CustomError(`Invalid abstract syntax tree; expected "NIN", received ${ast[0]}`, 'QueryCompileException');
  }

  const key = compileKey(ast[1]);
  const values = compileValues(ast[2]);

  const sql = [key.sql];
  let params = key.params;

  sql.push('NOT IN', values.sql);
  params = params.concat(values.params);

  return {params, sql: sql.join(' ')};
}

export default compile;
