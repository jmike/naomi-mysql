import _ from 'lodash';
import type from 'type-of';
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
function compile(props) {
  // make sure props is object
  if (!_.isObject(props)) {
    throw new TypeError(`Invalid "props" argument; expected object, received ${type(props)}`);
  }

  // make sure props contains collection ast
  if (!_.isArray(props.collection)) {
    throw new TypeError(`Invalid "collection" property; expected array, received ${type(props.collection)}`);
  }

  // make sure props contains selection ast
  if (!_.isArray(props.selection)) {
    throw new TypeError(`Invalid "selection" property; expected array, received ${type(props.selection)}`);
  }

  // make sure props contains orderby ast
  if (!_.isArray(props.orderby)) {
    throw new TypeError(`Invalid "orderby" property; expected array, received ${type(props.orderby)}`);
  }

  // make sure props contains limit ast
  if (!_.isArray(props.limit)) {
    throw new TypeError(`Invalid "limit" property; expected array, received ${type(props.limit)}`);
  }

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

  return { params, sql: `${sql.join(' ')};` };
}

export default compile;
