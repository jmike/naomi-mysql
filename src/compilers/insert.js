import escapeIdentifier from './escape';

/**
 * Compiles and returns a parameterized SQL "insert" query.
 * @param {Object} props query properties.
 * @param {string} props.table the name of the table.
 * @param {Array<Object>} props.records an array of records to insert.
 * @param {boolean} [props.ignore=false] whether to compile an "INSERT IGNORE" query.
 * @return {Object}
 * @throws {NotImplementedException} if method has not been implemented or does not apply to the current database engine.
 */
function compile(props: {table: string, columns: Array<string>, records: Array<Object>, ignore: ?boolean}): Object {
  const sql = [];
  const params = [];

  sql.push('INSERT');

  if (props.ignore === true) {
    sql.push('IGNORE');
  }

  sql.push('INTO', escapeIdentifier(props.table));

  const columns = props.columns.map((e) => escapeIdentifier(e)).join(', ');
  sql.push(`(${columns})`);

  const values = props.records
    .map((e) => {
      const group = props.columns
        .map(function (k) {
          params.push(e[k]);
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
