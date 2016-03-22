import escapeIdentifier from './escape';
import compileCollection from './collection';

/**
 * Compiles and returns a parameterized SQL "insert" query.
 * @param {Object} props query properties.
 * @param {Array} props.collection collection AST.
 * @param {Array<string>} props.keys collection keys.
 * @param {Array<Object>} props.values an array of records to insert to table.
 * @param {boolean} props.ignore enables "IGNORE" mode if set to true.
 * @return {Object}
 */
function compile(props: {collection: Array, keys: Array<string>, values: Array<Object>, ignore: ?boolean}): Object {
  const sql = [];
  let params = [];

  sql.push('INSERT');

  if (props.ignore === true) sql.push('IGNORE');

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

  return {params, sql: sql.join(' ') + ';'};
}

export default compile;
