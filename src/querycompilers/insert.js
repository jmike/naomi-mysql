import escapeIdentifier from './escape';
import Schema from '../Schema';

/**
 * Compiles and returns a parameterized SQL "insert" query.
 * @param {Object} props query properties.
 * @param {string} props.table the name of the table.
 * @param {Array<string>} props.columns the columns of the table.
 * @param {Array<Object>} props.values an array of records to insert to table.
 * @param {boolean} props.ignore returns "INSERT IGNORE" if set to true.
 * @return {Object}
 * @throws {NotImplementedException} if method has not been implemented or does not apply to the current database engine.
 */
function compile(props: {table: string, columns: Array<string>, values: Array<Object>, ignore: boolean}): Object {
  const sql = [];
  const params = [];

  sql.push('INSERT');

  if (props.ignore === true) {
    sql.push('IGNORE');
  }

  sql.push('INTO', escapeIdentifier(props.table));

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

  return {params, sql: sql.join(' ') + ';'};
}

export default compile;
