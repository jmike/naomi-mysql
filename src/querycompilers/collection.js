import compileKey from './key';

/**
 * Compiles and returns a parameterized SQL "from" expression, based on the supplied AST.
 * @param {Array} ast abstract syntax tree.
 * @return {Object}
 */
function compile(ast: Array): Object {
  // make sure AST function is valid
  if (ast[0] !== 'COLLECTION') {
    throw new TypeError(`Invalid AST function; expected "COLLECTION", received "${ast[0]}"`);
  }

  return compileKey(ast[1]);
}

export default compile;
