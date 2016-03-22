import _ from 'lodash';
import compileCollection from './collection';
import compileSelection from './selection';
import compileOrderBy from './orderBy';
import compileLimit from './limit';

/**
 * Compiles and returns a parameterized SQL "remove" query.
 * @param {Object} props query properties.
 * @param {Array} props.collection collection AST.
 * @param {Array} props.selection selection AST.
 * @param {Array} props.orderby orderby AST.
 * @param {Array} props.limit limit AST.
 * @return {Object}
 */
function compile(props: {collection: Array, selection: Array, orderby: Array, limit: Array}): Object {
  const sql = [];
  let params = [];

  sql.push('DELETE');

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
  }

  return {params, sql: sql.join(' ') + ';'};
}

export default compile;
