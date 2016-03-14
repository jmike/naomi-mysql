import escapeIdentifier from './escape';

/**
 * Compiles and returns a parameterized SQL "insert ... on duplicate key update" query.
 * @param {Object} props query properties.
 * @param {string} props.table the name of the table.
 * @param {Array<string>} props.columns the columns of the table.
 * @param {Array<string>} props.updateColumns the columns to update on duplicate key.
 * @param {Array<Object>} props.values an array of records to upsert to table.
 * @return {Object}
 * @throws {NotImplementedException} if method has not been implemented or does not apply to the current database engine.
 */
function compile(props: {table: string, columns: Array<string>, updateColumns: Array<string>, values: Array<Object>}): Object {
  const sql = [];
  const params = [];

  sql.push('INSERT INTO', escapeIdentifier(props.table));

  const columns = props.columns.map((e) => escapeIdentifier(e)).join(', ');
  sql.push(`(${columns})`);

  const values = props.values
    .map((obj) => {
      const group = props.columns
        .map((k) => {
          params.push(obj[k]);
          return '?';
        })
        .join(', ');

      return `(${group})`;
    })
    .join(', ');

  sql.push('VALUES', values);

  const updateColumns = props.updateColumns
    .map((k) => {
      k = escapeIdentifier(k);
      return `${k} = VALUES(${k})`;
    })
    .join(', ');

  sql.push('ON DUPLICATE KEY UPDATE', updateColumns);

  return {params, sql: sql.join(' ') + ';'};
}

export default compile;
