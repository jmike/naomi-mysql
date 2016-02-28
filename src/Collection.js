// import _ from 'lodash';
// import Promise from 'bluebird';
// import mysql from 'mysql';
// import type from 'type-of';
import {Collection} from 'naomi';
import QueryCompiler from './QueryCompiler';
import Schema from './Schema';

class MySqlCollection extends Collection {

  /**
   * Constructs a new Collection instance.
   * @param {Database} db reference to the parent database.
   * @param {string} name the name of the collection.
   * @param {Object} [schema] the schema definition of the collection.
   * @throws {TypeError} if arguments are of invalid type
   * @constructor
   */
  constructor(db: Database, name: string, schema: ?Object) {
    super(db, name, schema);

    // overwrite compiler property with custom MySQL query compiler
    this.compiler = new QueryCompiler(this.name, this.schema);
  }

  /**
   * Reverse engineers the collection's schema from metadata retrieved from the database.
   * This function will update the collection's schema.
   * @param {Function<Error>} [callback] an optional callback function.
   * @return {Promise}
   */
  reverseEngineer(callback: ?Function): Promise {
    const sql = `
      SELECT
        \`COLUMN_NAME\`,
        \`DATA_TYPE\`,
        \`IS_NULLABLE\`,
        \`EXTRA\`,
        \`COLUMN_DEFAULT\`,
        \`COLLATION_NAME\`,
        \`COLUMN_COMMENT\`,
        \`ORDINAL_POSITION\`
      FROM information_schema.COLUMNS
      WHERE \`TABLE_SCHEMA\` = ? AND \`TABLE_NAME\` = ?
      ORDER BY \`ORDINAL_POSITION\` ASC;
    `;
    const params = [this.db.name, this.name];

    const re = /auto_increment/i;

    return this.db.query(sql, params)
      .map((record) => {
        return {
          name: record.COLUMN_NAME,
          type: record.DATA_TYPE,
          isNullable: record.IS_NULLABLE === 'YES',
          isAutoInc: re.test(record.EXTRA),
          default: record.COLUMN_DEFAULT,
          collation: record.COLLATION_NAME,
          comment: (record.COLUMN_COMMENT === '') ? null : record.COLUMN_COMMENT
        };
      })
      .then((metadata) => {
        return Schema.fromMetadata(metadata);
      })
      .nodeify(callback);
  }

}

export default MySqlCollection;
