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
        \`ORDINAL_POSITION\`,
        \`COLUMN_NAME\`,
        \`DATA_TYPE\`,
        \`COLUMN_TYPE\`,
        \`CHARACTER_MAXIMUM_LENGTH\`,
        \`NUMERIC_PRECISION\`,
        \`NUMERIC_SCALE\`,
        \`DATETIME_PRECISION\`
        \`IS_NULLABLE\`,
        \`EXTRA\`,
        \`COLUMN_DEFAULT\`,
        \`CHARACTER_SET_NAME\`,
        \`COLLATION_NAME\`,
        \`COLUMN_COMMENT\`
      FROM information_schema.COLUMNS
      WHERE \`TABLE_SCHEMA\` = ? AND \`TABLE_NAME\` = ?
      ORDER BY \`ORDINAL_POSITION\` ASC;
    `;
    const params = [this.db.name, this.name];

    return this.db.query(sql, params)
      .then((metadata) => {
        return Schema.fromMetadata(metadata);
      })
      .nodeify(callback);
  }

}

export default MySqlCollection;
