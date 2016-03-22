import _ from 'lodash';
import compileKey from './key';

/**
 * Compiles and returns a parameterized SQL "projection" clause, based on the supplied AST.
 * @param {Array} ast abstract syntax tree, as given by the QueryParser.
 * @return {Object}
 */
function compile(ast: Array): Object {
  // make sure AST function is valid
  if (ast[0] !== 'PROJECT') {
    throw new TypeError(`Invalid AST function; expected "PROJECT", received "${ast[0]}"`);
  }

  // handle null argument
  if (_.isNil(ast[1])) {
    return {sql: '*', params: []};
  }

  const sql = [];
  let params = [];

  _.tail(ast).forEach((e) => {
    const key = compileKey(e);

    sql.push(key.sql);

    if (key.params.length !== 0) {
      params = params.concat(key.params);
    }
  });

  return {params, sql: sql.join(', ')};
}

export default compile;
