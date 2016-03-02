import CustomError from 'customerror';

/**
 * Compiles and returns a parameterized SQL "value" expression, based on the supplied AST.
 * @param {Array} ast abstract syntax tree, as given by the QueryParser.
 * @return {Object}
 */
function compile(ast: Array): Object {
  if (ast[0] !== 'VALUE') {
    throw new CustomError(`Invalid abstract syntax tree; expected "VALUE", received ${ast[0]}`, 'QueryCompileException');
  }

  const sql = '?';
  const params = [ast[1]];

  return {params, sql};
}

export default compile;
