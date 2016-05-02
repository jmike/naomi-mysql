import _ from 'lodash';
import type from 'type-of';
import escapeIdentifier from './escape';
import compileCollection from './collection';

/**
 * Compiles and returns a parameterized SQL "insert ... on duplicate key update" query.
 * @param {Object} props query properties.
 * @param {Array} props.collection collection AST.
 * @param {Array<string>} props.keys the keys of the table.
 * @param {Array<string>} props.updateKeys the keys to update on duplicate key.
 * @param {Array<Object>} props.values an array of records to upsert to table.
 * @return {Object}
 * @throws {NotImplementedException} if method has not been implemented or does not apply to the current database engine.
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

  // make sure props contains keys
  if (!_.isArray(props.keys)) {
    throw new TypeError(`Invalid "keys" property; expected array, received ${type(props.keys)}`);
  }

  // make sure props contains updateKeys
  if (!_.isArray(props.updateKeys)) {
    throw new TypeError(`Invalid "updateKeys" property; expected array, received ${type(props.updateKeys)}`);
  }

  // make sure props contains values
  if (!_.isArray(props.values)) {
    throw new TypeError(`Invalid "values" property; expected array, received ${type(props.values)}`);
  }

  const sql = [];
  let params = [];

  sql.push('INSERT');

  const collection = compileCollection(props.collection);
  sql.push('INTO', collection.sql);
  params = params.concat(collection.params);

  const columns = props.keys.map((e) => escapeIdentifier(e)).join(', ');
  sql.push(`(${columns})`);

  const values = props.values
    .map((obj) => {
      const group = props.keys
        .map((k) => {
          params.push(obj[k]);
          return '?';
        })
        .join(', ');

      return `(${group})`;
    })
    .join(', ');

  sql.push('VALUES', values);

  const updateColumns = props.updateKeys
    .map((k) => {
      k = escapeIdentifier(k);
      return `${k} = VALUES(${k})`;
    })
    .join(', ');

  sql.push('ON DUPLICATE KEY UPDATE', updateColumns);

  return { params, sql: `${sql.join(' ')};` };
}

export default compile;
