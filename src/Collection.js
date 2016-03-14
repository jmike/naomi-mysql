import _ from 'lodash';
import Promise from 'bluebird'; // eslint-disable-line
import type from 'type-of';
import Collection from 'naomi/src/Collection';
import Schema from './Schema';
import compileFindQuery from './querycompilers/find';
import compileCountQuery from './querycompilers/count';
import compileInsertQuery from './querycompilers/insert';
import compileUpsertQuery from './querycompilers/upsert';
import compileUpdateQuery from './querycompilers/update';
import compileRemoveQuery from './querycompilers/remove';

class MySqlCollection extends Collection {

  /**
   * Retrieves designated records from the collection.
   * @param {(boolean|number|string|Date|Object|Array<Object>)} selection a naomi selection expression.
   * @param {Object} [options] query options.
   * @param {Object} [options.projection] a naomi projection expression.
   * @param {(string, Object, Array<string, Object)} [options.orderby] a naomi orderby expression.
   * @param {number} [options.limit] maximum number of records to retrieve.
   * @param {number} [options.offset] number of records to skip.
   * @param {Function<Error, Array<Object>>} [callback] an optional callback function.
   * @returns {Promise<Array<Object>>} a bluebird promise resolving to an array of records.
   * @throws {TypeError} if arguments are of invalid type.
   */
  find(selection: boolean | number | string | Object | ?Function, options: Object | ?Function, callback: ?Function): Promise {
    // handle optional arguments
    if (_.isFunction(selection)) {
      callback = selection;
      selection = undefined;
      options = {};
    }

    if (_.isFunction(options)) {
      callback = options;
      options = {};
    }

    // compile parameterized SQL query
    const query = compileFindQuery({
      table: this.name,
      selection: this.parseSelection(selection),
      projection: this.parseProjection(options.projection),
      orderby: this.parseOrderBy(options.orderby),
      limit: this.parseLimit(options.limit),
      offset: this.parseOffset(options.offset),
    });

    // run statement
    return this.db.query(query.sql, query.params)
      .nodeify(callback);
  }

  /**
   * Retrieves a single designated record from the collection.
   * @param {(boolean|number|string|Date|Object|Array<Object>)} selection an optional naomi selection expression.
   * @param {Object} [options] query options.
   * @param {Object} [options.projection] a naomi projection expression.
   * @param {(string, Object, Array<string, Object)} [options.orderby] a naomi orderby expression.
   * @param {Function<Error, Object>} [callback] an optional callback function
   * @returns {Promise<Object>} a bluebird promise resolving to a single record.
   * @throws {TypeError} if arguments are of invalid type.
   */
  findOne(selection: boolean | number | string | Object | ?Function, options: Object | ?Function, callback: ?Function): Promise {
    // handle optional arguments
    if (_.isFunction(selection)) {
      callback = selection;
      selection = undefined;
      options = {};
    }

    if (_.isFunction(options)) {
      callback = options;
      options = {};
    }

    // compile parameterized SQL query
    const query = compileFindQuery({
      table: this.name,
      selection: this.parseSelection(selection),
      projection: this.parseProjection(options.projection),
      orderby: this.parseOrderBy(options.orderby),
      limit: this.parseLimit(1),
      offset: this.parseOffset(0),
    });

    // run statement
    return this.db.query(query.sql, query.params)
      .then((records) => records[0]) // return sigle record
      .nodeify(callback);
  }

  /**
   * Counts designated records in the collection.
   * @param {(boolean|number|string|Date|Object|Array<Object>)} selection a naomi selection expression.
   * @param {Object} [options] query options.
   * @param {(string, Object, Array<string, Object)} [options.orderby] a naomi orderby expression.
   * @param {number} [options.limit] maximum number of records to retrieve.
   * @param {number} [options.offset] number of records to skip.
   * @param {Function<Error, number>} [callback] an optional callback function.
   * @returns {Promise<number>} a bluebird promise resolving to the number of records.
   * @throws {TypeError} if arguments are of invalid type.
   */
  count(selection: boolean | number | string | Object | ?Function, options: Object | ?Function, callback: ?Function): Promise {
    // handle optional arguments
    if (_.isFunction(selection)) {
      callback = selection;
      selection = undefined;
      options = {};
    }

    if (_.isFunction(options)) {
      callback = options;
      options = {};
    }

    // compile parameterized SQL query
    const query = compileCountQuery({
      table: this.name,
      selection: this.parseSelection(selection),
      orderby: this.parseOrderBy(options.orderby),
      limit: this.parseLimit(1),
      offset: this.parseOffset(0),
    });

    // run statement
    return this.db.query(query.sql, query.params)
      .then((records) => records[0].count || 0) // return count
      .nodeify(callback);
  }

  /**
   * Removes designated records from the collection.
   * @param {(boolean|number|string|Date|Object|Array<Object>)} [selection] an optional naomi selection expression.
   * @param {Object} [options] query options.
   * @param {(string, Object, Array<string, Object)} [options.orderby] a naomi orderby expression.
   * @param {number} [options.limit] maximum number of records to retrieve.
   * @param {Function<Error>} [callback] an optional callback function.
   * @returns {Promise>} a bluebird promise.
   * @throws {TypeError} if arguments are of invalid type.
   */
  remove(selection: boolean | number | string | Object | ?Function, options: Object | ?Function, callback: ?Function): Promise {
    // handle optional arguments
    if (_.isFunction(selection)) {
      callback = selection;
      selection = undefined;
      options = {};
    }

    if (_.isFunction(options)) {
      callback = options;
      options = {};
    }

    // compile parameterized SQL query
    const query = compileRemoveQuery({
      table: this.name,
      selection: this.parseSelection(selection),
      orderby: this.parseOrderBy(options.orderby),
      limit: this.parseLimit(1),
    });

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
    // validate arguments
    if (_.isPlainObject(records)) {
      records = [records];
    } else if (!_.isArray(records)) {
      throw new TypeError(`Invalid records argument; exprected object or array, received ${type(records)}`);
    }

    // handle optional arguments
    if (_.isFunction(options)) {
      callback = options;
      options = {};
    }

    // set default options
    options = _.defaults(options, {
      ignore: false
    });

    // validate records values
    return Promise.map(records, (record) => this.schema.validate(record))

      // compile parameterized SQL query
      .then((values) => {
        return compileInsertQuery({
          records: values,
          ignore: options.ignore,
          table: this.name,
          columns: this.schema.keys(),
        });
      })

      // execute query
      .then((query) => this.db.query(query.sql, query.params))

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
    if (!_.isPlainObject(records) && !_.isArray(records)) {
      throw new TypeError(`Invalid records argument; exprected object or array, received ${type(records)}`);
    }

    // handle optional arguments
    if (_.isFunction(options)) {
      callback = options;
      options = {};
    }

    // compile parameterized SQL query
    const query = compileUpsertQuery({
      records,
      table: this.name,
      columns: this.schema.keys(),
    });

    // run statement
    return this.db.query(query.sql, query.params)
      .nodeify(callback);
  }

  /**
   * Updates the designated record(s) in the collection.
   * @param {(boolean|number|string|Date|Object|Array<Object>)} selection a naomi selection expression.
   * @param {Object} values key-value pairs to set in the updated records.
   * @param {Object} [options] query options.
   * @param {(string, Object, Array<string, Object)} [options.orderby] a naomi orderby expression.
   * @param {number} [options.limit] maximum number of records to retrieve.
   * @param {Function<err, Object>} [callback] an optional callback function with (err, keys) argument.
   * @returns {Promise} a bluebird promise resolving to the primary key of the created/updated record(s).
   * @throws {TypeError} if arguments are of invalid type.
   */
  update(selection: boolean | number | string | ?Object, values: Object, options: ?Object, callback: ?Function): Promise {
    // validate arguments
    if (!_.isPlainObject(values)) {
      throw new TypeError(`Invalid values argument; exprected object, received ${type(values)}`);
    }

    // handle optional arguments
    if (_.isFunction(options)) {
      callback = options;
      options = {};
    }

    // compile parameterized SQL query
    const query = compileUpdateQuery({
      values,
      table: this.name,
      selection: this.parseSelection(selection),
      orderby: this.parseOrderBy(options.orderby),
      limit: this.parseLimit(1),
    });

    // run statement
    return this.db.query(query.sql, query.params)
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
