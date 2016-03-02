import _ from 'lodash';
import escapeIdentifier from './escape';
import compileProjection from './projection';
import compileSelection from './selection';
import compileOrderBy from './orderBy';
import compileLimit from './limit';
import compileOffset from './offset';

/**
 * Compiles and returns a parameterized SQL "find" query.
 * @param {Object} props query properties.
 * @param {string} props.table the name of the table.
 * @param {Array} props.selection selection AST as provided by the QueryParser.
 * @param {Array} props.projection projection AST as provided by the QueryParser.
 * @param {Array} props.orderby orderby AST as provided by the QueryParser.
 * @param {Array} props.limit limit AST as provided by the QueryParser.
 * @param {Array} props.offset offset AST as provided by the QueryParser.
 * @return {Object}
 */
function compile(props: {table: string, selection: Array, projection: Array, orderby: Array, limit: Array, offset: Array}): Object {
  const sql = [];
  let params = [];

  sql.push('SELECT');

  const projection = compileProjection(props.projection);
  sql.push(projection.sql);
  params = params.concat(projection.params);

  sql.push('FROM', escapeIdentifier(props.table));

  const selection = compileSelection(props.selection);

  if (!_.isEmpty(selection.sql)) {
    sql.push('WHERE', selection.sql);
    params = params.concat(selection.params);
  }

  const orderby = compileOrderBy(props.orderby);

  if (!_.isEmpty(orderby.sql)) {
    sql.push('ORDER BY', orderby.sql);
    params = params.concat(orderby.params);
  }

  const limit = compileLimit(props.limit);

  if (!_.isEmpty(limit.sql)) {
    sql.push('LIMIT', limit.sql);
    params = params.concat(limit.params);

    const offset = compileOffset(props.offset);

    if (!_.isEmpty(offset.sql)) {
      sql.push('OFFSET', offset.sql);
      params = params.concat(offset.params);
    }
  }

  return {params, sql: sql.join(' ') + ';'};
}

export default compile;
