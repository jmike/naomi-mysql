import _ from 'lodash';
import compileCollection from './collection';
import compileSelection from './selection';
import compileOrderBy from './orderBy';
import compileLimit from './limit';
import compileOffset from './offset';

/**
 * Compiles and returns a parameterized SQL "count" query.
 * @param {Object} props query properties.
 * @param {Array} props.collection collection AST.
 * @param {Array} props.selection selection AST.
 * @param {Array} props.orderby orderby AST.
 * @param {Array} props.limit limit AST.
 * @param {Array} props.offset offset AST.
 * @return {Object}
 */
function compile(props: {collection: Array, selection: Array, orderby: Array, limit: Array, offset: Array}): Object {
  const sql = [];
  let params = [];

  sql.push('SELECT COUNT(*) AS `count`');

  const collection = compileCollection(props.collection);
  sql.push('FROM', collection.sql);
  params = params.concat(collection.params);

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
