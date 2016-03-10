import CustomError from 'customerror';
import escapeIdentifier from './escape';

/**
 * Compiles and returns a parameterized SQL "key" expression, based on the supplied AST.
 * @param {Array} ast abstract syntax tree, as given by the QueryParser.
 * @return {Object}
 */
function compile(ast: Array): Object {
  if (ast[0] !== 'KEY') {
    throw new CustomError(`Invalid abstract syntax tree; expected "KEY", received ${ast[0]}`, 'QueryCompileException');
  }

  const sql = escapeIdentifier(ast[1]);
  const params = [];

  return {sql, params};
}

export default compile;