import _ from 'lodash';
import escapeIdentifier from './escape';
import compileCollection from './collection';
import compileSelection from './selection';
import compileOrderBy from './orderBy';
import compileLimit from './limit';

/**
 * Compiles and returns a parameterized SQL "update" query.
 * @param {Object} props query properties.
 * @param {Array} props.collection collection AST.
 * @param {Array} props.selection selection AST.
 * @param {Array} props.orderby orderby AST.
 * @param {Array} props.limit limit AST.
 * @param {Object} props.values a object of values to set in the updated records.
 * @return {Object}
 * @throws {NotImplementedException} if method has not been implemented or does not apply to the current database engine.
 */
function compile(props: {collection: Array, attrs: Object, selection: Array, orderby: Array, limit: Array}): Object {
  const sql = [];
  let params = [];

  sql.push('UPDATE');

  const collection = compileCollection(props.collection);
  sql.push(collection.sql);
  params = params.concat(collection.params);

  const values = _.keys(props.attrs)
    .map((k) => {
      params.push(props.attrs[k]);
      return `${escapeIdentifier(k)} = ?`;
    })
    .join(', ');

  sql.push('SET', values);

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
