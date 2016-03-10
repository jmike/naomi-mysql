import _ from 'lodash';
import CustomError from 'customerror';

/**
 * Compiles and returns a parameterized SQL "offset" expression, based on the supplied AST.
 * @param {Array} ast abstract syntax tree, as given by the QueryParser.
 * @return {Object}
 */
function compile(ast: Array): Object {
  if (ast[0] !== 'OFFSET') {
    throw new CustomError(`Invalid abstract syntax tree; expected "OFFSET", received ${ast[0]}`, 'QueryCompileException');
  }

  if (_.isNil(ast[1])) {
    return {sql: '', params: []};
  }

  return {sql: ast[1].toString(), params: []};
}

export default compile;