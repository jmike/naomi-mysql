import _ from 'lodash';
import type from 'type-of';
import compileKey from './key';

/**
 * Compiles and returns a parameterized SQL "value" expression, based on the supplied AST.
 * @param {Array} ast abstract syntax tree, as given by the QueryParser.
 * @return {Object}
 * @private
 */
function compileValue(ast) {
  const sql = '?';
  const params = [ast[1]];

  return { params, sql };
}

/**
 * Compiles and returns a parameterized SQL "values" expression, based on the supplied AST.
 * @param {Array} ast abstract syntax tree, as given by the QueryParser.
 * @return {Object}
 * @private
 */
function compileValues(ast) {
  const sql = [];
  const params = [];

  _.tail(ast).forEach((e) => {
    sql.push('?');
    params.push(e);
  });

  return { params, sql: `(${sql.join(', ')})` };
}

/**
 * Compiles and returns a parameterized SQL "equal" expression, based on the supplied AST.
 * @param {Array} ast abstract syntax tree, as given by the QueryParser.
 * @return {Object}
 * @private
 */
function compileEqual(ast) {
  const key = compileKey(ast[1]);
  const value = compileValue(ast[2]);

  const sql = [key.sql];
  let params = key.params;

  if (value.params[0] === null) {
    sql.push('IS NULL');
  } else {
    sql.push('=', value.sql);
    params = params.concat(value.params);
  }

  return { params, sql: sql.join(' ') };
}

/**
 * Compiles and returns a parameterized SQL "not equal" expression, based on the supplied AST.
 * @param {Array} ast abstract syntax tree, as given by the QueryParser.
 * @return {Object}
 * @private
 */
function compileNotEqual(ast) {
  const key = compileKey(ast[1]);
  const value = compileValue(ast[2]);

  const sql = [key.sql];
  let params = key.params;

  if (value.params[0] === null) {
    sql.push('IS NOT NULL');
  } else {
    sql.push('!=', value.sql);
    params = params.concat(value.params);
  }

  return { params, sql: sql.join(' ') };
}

/**
 * Compiles and returns a parameterized SQL "greater than" expression, based on the supplied AST.
 * @param {Array} ast abstract syntax tree, as given by the QueryParser.
 * @return {Object}
 * @private
 */
function compileGreaterThan(ast) {
  const key = compileKey(ast[1]);
  const value = compileValue(ast[2]);

  const sql = [key.sql];
  let params = key.params;

  sql.push('>', value.sql);
  params = params.concat(value.params);

  return { params, sql: sql.join(' ') };
}

/**
 * Compiles and returns a parameterized SQL "greater than or equal" expression, based on the supplied AST.
 * @param {Array} ast abstract syntax tree, as given by the QueryParser.
 * @return {Object}
 * @private
 */
function compileGreaterThanOrEqual(ast) {
  const key = compileKey(ast[1]);
  const value = compileValue(ast[2]);

  const sql = [key.sql];
  let params = key.params;

  sql.push('>=', value.sql);
  params = params.concat(value.params);

  return { params, sql: sql.join(' ') };
}

/**
 * Compiles and returns a parameterized SQL "less than" expression, based on the supplied AST.
 * @param {Array} ast abstract syntax tree, as given by the QueryParser.
 * @return {Object}
 * @private
 */
function compileLessThan(ast) {
  const key = compileKey(ast[1]);
  const value = compileValue(ast[2]);

  const sql = [key.sql];
  let params = key.params;

  sql.push('<', value.sql);
  params = params.concat(value.params);

  return { params, sql: sql.join(' ') };
}

/**
 * Compiles and returns a parameterized SQL "less than or equal" expression, based on the supplied AST.
 * @param {Array} ast abstract syntax tree, as given by the QueryParser.
 * @return {Object}
 * @private
 */
function compileLessThanOrEqual(ast) {
  const key = compileKey(ast[1]);
  const value = compileValue(ast[2]);

  const sql = [key.sql];
  let params = key.params;

  sql.push('<=', value.sql);
  params = params.concat(value.params);

  return { params, sql: sql.join(' ') };
}

/**
 * Compiles and returns a parameterized SQL "in" expression, based on the supplied AST.
 * @param {Array} ast abstract syntax tree, as given by the QueryParser.
 * @return {Object}
 * @private
 */
function compileIn(ast) {
  const key = compileKey(ast[1]);
  const values = compileValues(ast[2]);

  const sql = [key.sql];
  let params = key.params;

  sql.push('IN', values.sql);
  params = params.concat(values.params);

  return { params, sql: sql.join(' ') };
}

/**
 * Compiles and returns a parameterized SQL "not in" expression, based on the supplied AST.
 * @param {Array} ast abstract syntax tree, as given by the QueryParser.
 * @return {Object}
 * @private
 */
function compileNotIn(ast) {
  const key = compileKey(ast[1]);
  const values = compileValues(ast[2]);

  const sql = [key.sql];
  let params = key.params;

  sql.push('NOT IN', values.sql);
  params = params.concat(values.params);

  return { params, sql: sql.join(' ') };
}

/**
 * Compiles and returns a parameterized SQL "like" expression, based on the supplied AST.
 * @param {Array} ast abstract syntax tree, as given by the QueryParser.
 * @return {Object}
 * @private
 */
function compileLike(ast) {
  const key = compileKey(ast[1]);
  const value = compileValue(ast[2]);

  const sql = [key.sql];
  let params = key.params;

  sql.push('LIKE', value.sql);
  params = params.concat(value.params);

  return { params, sql: sql.join(' ') };
}

/**
 * Compiles and returns a parameterized SQL "not like" expression, based on the supplied AST.
 * @param {Array} ast abstract syntax tree, as given by the QueryParser.
 * @return {Object}
 * @private
 */
function compileNotLike(ast) {
  const key = compileKey(ast[1]);
  const value = compileValue(ast[2]);

  const sql = [key.sql];
  let params = key.params;

  sql.push('NOT LIKE', value.sql);
  params = params.concat(value.params);

  return { params, sql: sql.join(' ') };
}

/**
 * Compiles and returns a parameterized SQL "and" expression, based on the supplied AST.
 * @param {Array} ast abstract syntax tree, as given by the QueryParser.
 * @return {Object}
 * @private
 */
function compileAnd(ast) {
  // make sure ast function is "AND"
  if (ast[0] !== 'AND') {
    throw new TypeError(`Invalid "ast" argument; expected "AND" at position 0, received "${ast[0]}"`);
  }

  const sql = [];
  let params = [];

  _.tail(ast).forEach((e) => {
    const expr = compile(['SELECTION', e]); // eslint-disable-line no-use-before-define
    sql.push(`(${expr.sql})`);
    params = params.concat(expr.params);
  });

  return { params, sql: sql.join(' AND ') };
}

/**
 * Compiles and returns a parameterized SQL "or" expression, based on the supplied AST.
 * @param {Array} ast abstract syntax tree, as given by the QueryParser.
 * @return {Object}
 * @private
 */
function compileOr(ast) {
  // make sure ast function is "OR"
  if (ast[0] !== 'OR') {
    throw new TypeError(`Invalid "ast" argument; expected "OR" at position 0, received "${ast[0]}"`);
  }

  const sql = [];
  let params = [];

  _.tail(ast).forEach((e) => {
    const expr = compile(['SELECTION', e]); // eslint-disable-line no-use-before-define
    sql.push(`(${expr.sql})`);
    params = params.concat(expr.params);
  });

  return { params, sql: sql.join(' OR ') };
}

/**
 * Compiles and returns a parameterized SQL "selection" clause, based on the supplied AST.
 * @param {Array} ast abstract syntax tree, as given by the QueryParser.
 * @return {Object}
 */
function compile(ast) {
  // make sure ast is array
  if (!_.isArray(ast)) {
    throw new TypeError(`Invalid "ast" argument; expected array, received ${type(ast)}`);
  }

  // make sure ast function is "SELECTION"
  if (ast[0] !== 'SELECTION') {
    throw new TypeError(`Invalid AST function; expected "SELECTION", received "${ast[0]}"`);
  }

  // handle nil ast argument
  if (_.isNil(ast[1])) {
    return { sql: '', params: [] };
  }

  // parse ast argument
  switch (ast[1][0]) {
    case 'EQ':
      return compileEqual(ast[1]);
    case 'NE':
      return compileNotEqual(ast[1]);
    case 'GT':
      return compileGreaterThan(ast[1]);
    case 'GTE':
      return compileGreaterThanOrEqual(ast[1]);
    case 'LT':
      return compileLessThan(ast[1]);
    case 'LTE':
      return compileLessThanOrEqual(ast[1]);
    case 'IN':
      return compileIn(ast[1]);
    case 'NIN':
      return compileNotIn(ast[1]);
    case 'LIKE':
      return compileLike(ast[1]);
    case 'NLIKE':
      return compileNotLike(ast[1]);
    case 'AND':
      return compileAnd(ast[1]);
    case 'OR':
      return compileOr(ast[1]);
    default:
      throw new TypeError(`Invalid "ast" argument; unknown identifier "${ast[1][0]}" at position 1:0`);
  }
}

export default compile;
