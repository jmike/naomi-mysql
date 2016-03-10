import _ from 'lodash';
import escapeIdentifier from './escape';
import compileSelection from './selection';
import compileOrderBy from './orderBy';
import compileLimit from './limit';

/**
 * Compiles and returns a parameterized SQL "remove" query.
 * @param {Object} props query properties.
 * @param {string} props.table the name of the table.
 * @param {Array} props.selection selection AST as provided by the QueryParser.
 * @param {Array} props.orderby orderby AST as provided by the QueryParser.
 * @param {Array} props.limit limit AST as provided by the QueryParser.
 * @return {Object}
 * @throws {NotImplementedException} if method has not been implemented or does not apply to the current database engine.
 */
function compile(props: {table: string, selection: Array, orderby: Array, limit: Array}): Object {
  const sql = [];
  let params = [];

  sql.push('DELETE', 'FROM', escapeIdentifier(props.table));

  // compile + append WHERE clause
  const selection = compileSelection(props.selection);

  if (!_.isEmpty(selection.sql)) {
    sql.push('WHERE', selection.sql);
    params = params.concat(selection.params);
  }

  // compile + append ORDER BY clause
  const orderby = compileOrderBy(props.orderby);

  if (!_.isEmpty(orderby.sql)) {
    sql.push('ORDER BY', orderby.sql);
    params = params.concat(orderby.params);
  }

  // compile + append LIMIT clause
  const limit = compileLimit(props.limit);

  if (!_.isEmpty(limit.sql)) {
    sql.push('LIMIT', limit.sql);
    params = params.concat(limit.params);
  }

  return {params, sql: sql.join(' ') + ';'};
}

export default compile;
