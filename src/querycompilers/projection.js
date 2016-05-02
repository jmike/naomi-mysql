import _ from 'lodash';
import type from 'type-of';
import compileKey from './key';

/**
 * Compiles and returns a parameterized SQL "projection" clause, based on the supplied AST.
 * @param {Array} ast abstract syntax tree, as given by the QueryParser.
 * @return {Object}
 */
function compile(ast) {
  // make sure ast is array
  if (!_.isArray(ast)) {
    throw new TypeError(`Invalid "ast" argument; expected array, received ${type(ast)}`);
  }

  // make sure ast function is "PROJECTION"
  if (ast[0] !== 'PROJECTION') {
    throw new TypeError(`Invalid AST function; expected "PROJECTION", received "${ast[0]}"`);
  }

  // handle nil ast argument
  if (_.isNil(ast[1])) {
    return { sql: '*', params: [] };
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

  return { params, sql: sql.join(', ') };
}

export default compile;
