import escapeIdentifier from './escape';

/**
 * Compiles and returns a parameterized SQL "insert ... on duplicate key update" query.
 * @param {Object} props query properties.
 * @param {string} props.table the name of the table.
 * @param {Array<Object>} props.records an array of records to upsert.
 * @return {Object}
 * @throws {NotImplementedException} if method has not been implemented or does not apply to the current database engine.
 */
function compile(props: {table: string, columns: Array<string>, records: Array<Object>}): Object {
  const sql = [];
  const params = [];

  sql.push('INSERT INTO', escapeIdentifier(props.table));

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

  const updateValues = props.columns
    .map((k) => {
      k = escapeIdentifier(k);
      return `${k} = VALUES(${k})`;
    })
    .join(', ');

  sql.push('ON DUPLICATE KEY UPDATE', updateValues);

  return {params, sql: sql.join(' ') + ';'};
}

export default compile;
