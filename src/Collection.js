import _ from 'lodash';
import Promise from 'bluebird'; // eslint-disable-line
import type from 'type-of';
import CustomError from 'customerror';
import Collection from 'naomi/src/Collection';
import Schema from './Schema';
import compileFindQuery from './querycompilers/find';
import compileCountQuery from './querycompilers/count';
import compileInsertQuery from './querycompilers/insert';
import compileUpsertQuery from './querycompilers/upsert';
import compileUpdateQuery from './querycompilers/update';
import compileRemoveQuery from './querycompilers/remove';
import extractKeys from './utils/extractKeysFromAST';

class MySqlCollection extends Collection {

  /**
   * Validates the given selection AST against the collection schema.
   * @param {Array} ast
   * @return {Array}
   * @throws {SelectionParseError} if selection is invalid
   */
  validateSelection(ast: Array): Array {
    const keys = extractKeys(ast);

    // make sure selection keys exist in schema
    keys.forEach((k) => {
      if (!this.schema.has(k)) {
        throw new CustomError(`Unknown key "${k}" not found in ${this.name} table`, 'SelectionParseError');
      }
    });

    return ast;
  }

  /**
   * Validates the given projection AST against the collection schema.
   * @param {Array} ast
   * @return {Array}
   * @throws {ProjectionParseError} if selection is invalid
   */
  validateProjection(ast: Array): Array {
    const keys = extractKeys(ast);

    // make sure projection keys exist in schema
    keys.forEach((k) => {
      if (!this.schema.has(k)) {
        throw new CustomError(`Unknown key "${k}" not found in ${this.name} table`, 'ProjectionParseError');
      }
    });

    // invert negative projection
    if (ast[0] === 'NPROJECTION') {
      const projection = _.chain(keys).xor(this.schema.keys()).map((k) => [k, 1]).fromPairs().value();
      return this.parseProjection(projection);
    }

    return ast;
  }

  /**
   * Validates the given orderby AST against the collection schema.
   * @param {Array} ast
   * @return {Array}
   * @throws {OrderByParseError} if selection is invalid
   */
  validateOrderBy(ast: Array): Array {
    const keys = extractKeys(ast);

    // make sure selection keys exist in schema
    keys.forEach((k) => {
      if (!this.schema.has(k)) {
        throw new CustomError(`Unknown key "${k}" not found in ${this.name} table`, 'OrderByParseError');
      }
    });

    return ast;
  }

  /**
   * Retrieves designated records from the collection.
   * @param {(boolean|number|string|Date|Object|Array<Object>)} [$query] a naomi query object.
   * @param {Object} [options] query options.
   * @param {Object} [options.projection] a naomi projection expression.
   * @param {(string, Object, Array<string, Object)} [options.orderby] a naomi orderby expression.
   * @param {number} [options.limit] maximum number of records to retrieve.
   * @param {number} [options.offset] number of records to skip.
   * @param {Function<Error, Array<Object>>} [callback] an optional callback function.
   * @returns {Promise<Array<Object>>} a bluebird promise resolving to an array of records.
   * @throws {TypeError} if arguments are of invalid type.
   */
  find($query: boolean | number | string | Object | ?Function, options: Object | ?Function, callback: ?Function): Promise {
    // handle optional arguments
    if (_.isFunction($query)) {
      callback = $query;
      $query = undefined;
      options = {};
    }

    if (_.isFunction(options)) {
      callback = options;
      options = {};
    }

    // parse input
    const collection = ['COLLECTION', ['KEY', this.name]];
    const selection = this.validateSelection(this.parseSelection($query));
    const projection = this.validateProjection(this.parseProjection(options.projection));
    const orderby = this.validateOrderBy(this.parseOrderBy(options.orderby));
    const limit = this.parseLimit(options.limit);
    const offset = this.parseOffset(options.offset);

    // compile parameterized SQL query
    const query = compileFindQuery({collection, selection, projection, orderby, limit, offset});

    // run statement
    return this.db.query(query.sql, query.params)
      .nodeify(callback);
  }

  /**
   * Retrieves a single designated record from the collection.
   * @param {(boolean|number|string|Date|Object|Array<Object>)} [$query] a naomi query object.
   * @param {Object} [options] query options.
   * @param {Object} [options.projection] a naomi projection expression.
   * @param {(string, Object, Array<string, Object)} [options.orderby] a naomi orderby expression.
   * @param {Function<Error, Object>} [callback] an optional callback function
   * @returns {Promise<Object>} a bluebird promise resolving to a single record.
   * @throws {TypeError} if arguments are of invalid type.
   */
  findOne($query: boolean | number | string | Object | ?Function, options: Object | ?Function, callback: ?Function): Promise {
    // handle optional arguments
    if (_.isFunction($query)) {
      callback = $query;
      $query = undefined;
      options = {};
    }

    if (_.isFunction(options)) {
      callback = options;
      options = {};
    }

    // parse input
    const collection = ['COLLECTION', ['KEY', this.name]];
    const selection = this.validateSelection(this.parseSelection($query));
    const projection = this.validateProjection(this.parseProjection(options.projection));
    const orderby = this.validateOrderBy(this.parseOrderBy(options.orderby));
    const limit = this.parseLimit(1);
    const offset = this.parseOffset(0);

    // compile parameterized SQL query
    const query = compileFindQuery({collection, selection, projection, orderby, limit, offset});

    // run statement
    return this.db.query(query.sql, query.params)
      .then((records) => records[0]) // return sigle record
      .nodeify(callback);
  }

  /**
   * Counts designated records in the collection.
   * @param {(boolean|number|string|Date|Object|Array<Object>)} [$query] a naomi query object.
   * @param {Object} [options] query options.
   * @param {(string, Object, Array<string, Object)} [options.orderby] a naomi orderby expression.
   * @param {number} [options.limit] maximum number of records to retrieve.
   * @param {number} [options.offset] number of records to skip.
   * @param {Function<Error, number>} [callback] an optional callback function.
   * @returns {Promise<number>} a bluebird promise resolving to the number of records.
   * @throws {TypeError} if arguments are of invalid type.
   */
  count($query: boolean | number | string | Object | ?Function, options: Object | ?Function, callback: ?Function): Promise {
    // handle optional arguments
    if (_.isFunction($query)) {
      callback = $query;
      $query = undefined;
      options = {};
    }

    if (_.isFunction(options)) {
      callback = options;
      options = {};
    }

    // parse input
    const collection = ['COLLECTION', ['KEY', this.name]];
    const selection = this.validateSelection(this.parseSelection($query));
    const orderby = this.validateOrderBy(this.parseOrderBy(options.orderby));
    const limit = this.parseLimit(options.limit);
    const offset = this.parseOffset(options.offset);

    // compile parameterized SQL query
    const query = compileCountQuery({collection, selection, orderby, limit, offset});

    // run statement
    return this.db.query(query.sql, query.params)
      .then((records) => records[0].count || 0) // return count
      .nodeify(callback);
  }

  /**
   * Removes designated records from the collection.
   * @param {(boolean|number|string|Date|Object|Array<Object>)} [$query] a naomi query object.
   * @param {Object} [options] query options.
   * @param {(string, Object, Array<string, Object)} [options.orderby] a naomi orderby expression.
   * @param {number} [options.limit] maximum number of records to retrieve.
   * @param {Function<Error>} [callback] an optional callback function.
   * @returns {Promise>} a bluebird promise.
   * @throws {TypeError} if arguments are of invalid type.
   */
  remove($query: boolean | number | string | Object | ?Function, options: Object | ?Function, callback: ?Function): Promise {
    // handle optional arguments
    if (_.isFunction($query)) {
      callback = $query;
      $query = undefined;
      options = {};
    }

    if (_.isFunction(options)) {
      callback = options;
      options = {};
    }

    // parse input
    const collection = ['COLLECTION', ['KEY', this.name]];
    const selection = this.validateSelection(this.parseSelection($query));
    const orderby = this.validateOrderBy(this.parseOrderBy(options.orderby));
    const limit = this.parseLimit(options.limit);

    // compile parameterized SQL query
    const query = compileRemoveQuery({collection, selection, orderby, limit});

    // run statement
    return this.db.query(query.sql, query.params)
      .nodeify(callback);
  }

  /**
   * Inserts the supplied record(s) to the collection.
   * @param {(Object|Array<Object>)} records the record(s) to insert to the collection.
   * @param {Object} [options] query options.
   * @param {boolean} [options.ignore=false] if true MySQL will perform an INSERT IGNORE query.
   * @param {Function<err, Object>} [callback] an optional callback function with (err, keys) argument.
   * @returns {Promise} a bluebird promise resolving to the primary key of the created record(s).
   * @throws {TypeError} if arguments are of invalid type.
   */
  insert(records: Object | Array<Object>, options: Object | ?Function, callback: ?Function): Promise {
    let isRecordsObject = false;

    // validate arguments
    if (_.isPlainObject(records)) {
      isRecordsObject = true;
      records = [records]; // make sure records is array
    } else if (!_.isArray(records)) {
      throw new TypeError(`Invalid records argument; exprected object or array, received ${type(records)}`);
    }

    // handle optional arguments
    if (_.isFunction(options)) {
      callback = options;
      options = {};
    }

    // validate records
    return Promise.map(records, (record) => this.schema.validate(record))

      // parse input + compile query
      .then((values) => {
        const collection = ['COLLECTION', ['KEY', this.name]];
        const keys = this.schema.keys();
        const ignore = options.ignore === true;

        return compileInsertQuery({collection, keys, values, ignore});
      })

      // execute query
      .then((query) => this.db.query(query.sql, query.params))

      // return record indices in db
      .then((result) => {
        const autoinc = this.schema.hasAutoIncPrimaryKey();

        return records.map((record, i) => {
          // check if table has simple auto-inc primary key
          if (autoinc) {
            return {[this.schema.primaryKey()[0]]: result.insertId + i};
          }

          // extract primary key from record
          return _.pick(record, this.schema.primaryKey());
        });
      })

      // return object, if object was received
      .then((arr) => {
        if (isRecordsObject) {
          return arr[0];
        }

        return arr;
      })

      .nodeify(callback);
  }

  /**
   * Creates, or updates if they already exist, the supplied record(s) in the collection.
   * @param {(Object|Array<Object>)} records the record(s) to insert to the collection.
   * @param {Object} [options] query options.
   * @param {Function<err, Object>} [callback] an optional callback function with (err, keys) argument.
   * @returns {Promise} a bluebird promise resolving to the primary key of the created record(s).
   * @throws {TypeError} if arguments are of invalid type.
   */
  upsert(records: Object, options: Object | ?Function, callback: ?Function): Promise {
    // validate arguments
    if (_.isPlainObject(records)) {
      records = [records]; // make sure records is array
    } else if (!_.isArray(records)) {
      throw new TypeError(`Invalid records argument; exprected object or array, received ${type(records)}`);
    }

    // handle optional arguments
    if (_.isFunction(options)) {
      callback = options;
      options = {};
    }

    // validate records
    return Promise.map(records, (record) => this.schema.validate(record))

      // parse input + compile query
      .then((values) => {
        const collection = ['COLLECTION', ['KEY', this.name]];
        const keys = this.schema.keys();
        const updateKeys = _.difference(keys, this.schema.primaryKeys());

        return compileUpsertQuery({collection, keys, updateKeys, values});
      })

      // execute query
      .then((query) => this.db.query(query.sql, query.params))

      // return record indices in db
      .then((result) => {
        const autoinc = this.schema.hasAutoIncPrimaryKey();
        let insertedRows = 0;

        return records.map((record, i) => {
          // check if record contains primary key
          const containsPrimaryKey = this.schema.primaryKey().every((k) => {
            return record.hasOwnProperty(k);
          });

          if (containsPrimaryKey) {
            return _.pick(record, this.schema.primaryKey());
          }

          // check if table has simple auto-inc primary key
          if (autoinc) {
            const obj = {[this.schema.primaryKey()[0]]: result.insertId + insertedRows};
            insertedRows++;

            return obj;
          }

          // return empty object by default
          return {};
        });
      })

      // return object, if object was received
      .then((arr) => {
        if (isRecordsObject) {
          return arr[0];
        }

        return arr;
      })

      .nodeify(callback);
  }

  /**
   * Updates the designated record(s) in the collection.
   * @param {(boolean|number|string|Date|Object|Array<Object>)} $query a naomi query object.
   * @param {Object} values key-value pairs to set in the updated records.
   * @param {Object} [options] query options.
   * @param {(string, Object, Array<string, Object)} [options.orderby] a naomi orderby expression.
   * @param {number} [options.limit] maximum number of records to retrieve.
   * @param {Function<err, Object>} [callback] an optional callback function with (err, keys) argument.
   * @returns {Promise} a bluebird promise resolving to the primary key of the updated record(s).
   * @throws {TypeError} if arguments are of invalid type.
   */
  update($query: boolean | number | string | ?Object, values: Object, options: ?Object, callback: ?Function): Promise {
    // validate arguments
    if (!_.isPlainObject(values)) {
      throw new TypeError(`Invalid values argument; exprected plain object, received ${type(values)}`);
    }

    // handle optional arguments
    if (_.isFunction(options)) {
      callback = options;
      options = {};
    }

    // validate values
    return this.schema.validate(values)

      // parse input + compile query
      .then((attrs) => {
        const collection = ['COLLECTION', ['KEY', this.name]];
        const selection = this.validateSelection(this.parseSelection($query));
        const orderby = this.validateOrderBy(this.parseOrderBy(options.orderby));
        const limit = this.parseLimit(options.limit);

        return compileUpdateQuery({attrs, collection, selection, orderby, limit});
      })

      // execute query
      .then((query) => this.db.query(query.sql, query.params))

      // compile find query
      .then(() => {
        const collection = ['COLLECTION', ['KEY', this.name]];
        const selection = this.validateSelection(this.parseSelection($query));
        const orderby = this.validateOrderBy(this.parseOrderBy(options.orderby));
        const limit = this.parseLimit(options.limit);
        const offset = this.parseOffset(null);

        const query = compileFindQuery({collection, selection, projection, orderby, limit, offset});
      })

      // execute find query
      .then((query) => this.db.query(query.sql, query.params))

      // return record indices in db
      .map((record) => _.pick(record, this.schema.primaryKey()))

      .nodeify(callback);
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
      .then((metadata) => Schema.fromMetadata(metadata))
      .nodeify(callback);
  }

}

export default MySqlCollection;
