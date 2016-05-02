import _ from 'lodash';
import Promise from 'bluebird'; // eslint-disable-line
import type from 'type-of';
import Collection from 'naomi/lib/Collection';
import Schema from './Schema';
import compileFindQuery from './querycompilers/find';
import compileCountQuery from './querycompilers/count';
import compileInsertQuery from './querycompilers/insert';
import compileUpsertQuery from './querycompilers/upsert';
import compileUpdateQuery from './querycompilers/update';
import compileRemoveQuery from './querycompilers/remove';

class MySqlCollection extends Collection {

  /**
   * Validates the given selection AST against the collection schema.
   * @param {Array} ast
   * @return {Array}
   * @throws {SelectionParseError} if selection is invalid
   */
  validateSelection(ast) {
    return this.validateKeysInAST(ast);
  }

  /**
   * Validates the given projection AST against the collection schema.
   * @param {Array} ast
   * @return {Array}
   * @throws {ProjectionParseError} if selection is invalid
   */
  validateProjection(ast) {
    // handle nil arguments
    if (_.isNil(ast[1])) {
      const projection = _.chain(this.schema.getKeys()).map((k) => [k, 1]).fromPairs().value();
      return this.parseProjection(projection);
    }

    // make sure projection keys exist in schema
    ast = this.validateKeysInAST(ast);

    // invert negative projection
    if (ast[0] === 'NPROJECTION') {
      const keys = this.extractKeysFromAST(ast);
      const projection = _.chain(keys).xor(this.schema.getKeys()).map((k) => [k, 1]).fromPairs().value();
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
  validateOrderBy(ast) {
    return this.validateKeysInAST(ast);
  }

  // replaceIdInAST(ast: Array): Array {
  //   this.schema.hasAtomicPrimaryKey();

  //   return ast.map((e) => {
  //     if (_.isArray(e)) {
  //       return this.replaceIdInAST(e);
  //     }

  //     if (e === 'ID') {
  //       return
  //     }

  //   })

  //   if (ast[0] === 'ID') {
  //     return
  //   }
  // }

  find(selector, options, callback) {
    // validate selector
    if (_.isFunction(selector)) {
      callback = selector;
      selector = undefined;
      options = {};
    } else if (!(
      _.isUndefined(selector) ||
      _.isBoolean(selector) ||
      _.isNumber(selector) ||
      _.isString(selector) ||
      _.isDate(selector) ||
      _.isPlainObject(selector) ||
      _.isArray(selector) ||
      Buffer.isBuffer(selector)
    )) {
      throw new TypeError('Invalid "selector" argument; ' +
        'expected boolean, number, string, date, object, array or buffer ' +
        `received ${type(selector)}`);
    }

    // validate options
    if (_.isFunction(options)) {
      callback = options;
      options = {};
    } else if (_.isUndefined(options)) {
      options = {};
    } else if (!_.isObject(options)) {
      throw new TypeError(`Invalid "options" argument; expected object, received ${type(options)}`);
    }

    // parse input
    const collection = ['COLLECTION', ['KEY', this.name]];
    const selection = this.validateSelection(this.parseSelection(selector));
    const projection = this.validateProjection(this.parseProjection(options.projection));
    const orderby = this.validateOrderBy(this.parseOrderBy(options.orderby));
    const limit = this.parseLimit(options.limit);
    const offset = this.parseOffset(options.offset);

    // compile parameterized SQL query
    const query = compileFindQuery({
      collection,
      selection,
      projection,
      orderby,
      limit,
      offset,
    });

    // execute query
    return this.db.execute(query).nodeify(callback);
  }


  findOne(selector, options, callback) {
    // validate selector
    if (_.isFunction(selector)) {
      callback = selector;
      selector = undefined;
      options = {};
    } else if (!(
      _.isUndefined(selector) ||
      _.isBoolean(selector) ||
      _.isNumber(selector) ||
      _.isString(selector) ||
      _.isDate(selector) ||
      _.isPlainObject(selector) ||
      _.isArray(selector) ||
      Buffer.isBuffer(selector)
    )) {
      throw new TypeError('Invalid "selector" argument; ' +
        'expected boolean, number, string, date, object, array or buffer ' +
        `received ${type(selector)}`);
    }

    // validate options
    if (_.isFunction(options)) {
      callback = options;
      options = {};
    } else if (_.isUndefined(options)) {
      options = {};
    } else if (!_.isObject(options)) {
      throw new TypeError(`Invalid "options" argument; expected object, received ${type(options)}`);
    }

    // parse input
    const collection = ['COLLECTION', ['KEY', this.name]];
    const selection = this.validateSelection(this.parseSelection(selector));
    const projection = this.validateProjection(this.parseProjection(options.projection));
    const orderby = this.validateOrderBy(this.parseOrderBy(options.orderby));
    const limit = this.parseLimit(1);
    const offset = this.parseOffset(options.offset);

    // compile parameterized SQL query
    const query = compileFindQuery({
      collection,
      selection,
      projection,
      orderby,
      limit,
      offset,
    });

    // execute query
    return this.db.execute(query)

      .then((records) => {
        return records[0]; // return sigle record
      })

      .nodeify(callback);
  }

  count(selector, options, callback) {
    // validate selector
    if (_.isFunction(selector)) {
      callback = selector;
      selector = undefined;
      options = {};
    } else if (!(
      _.isUndefined(selector) ||
      _.isBoolean(selector) ||
      _.isNumber(selector) ||
      _.isString(selector) ||
      _.isDate(selector) ||
      _.isPlainObject(selector) ||
      _.isArray(selector) ||
      Buffer.isBuffer(selector)
    )) {
      throw new TypeError('Invalid "selector" argument; ' +
        'expected boolean, number, string, date, object, array or buffer ' +
        `received ${type(selector)}`);
    }

    // validate options
    if (_.isFunction(options)) {
      callback = options;
      options = {};
    } else if (_.isUndefined(options)) {
      options = {};
    } else if (!_.isObject(options)) {
      throw new TypeError(`Invalid "options" argument; expected object, received ${type(options)}`);
    }

    // parse input
    const collection = ['COLLECTION', ['KEY', this.name]];
    const selection = this.validateSelection(this.parseSelection(selector));
    const orderby = this.validateOrderBy(this.parseOrderBy(options.orderby));
    const limit = this.parseLimit(options.limit);
    const offset = this.parseOffset(options.offset);

    // compile parameterized SQL query
    const query = compileCountQuery({
      collection,
      selection,
      orderby,
      limit,
      offset,
    });

    // execute query
    return this.db.execute(query)

      .then((records) => {
        return records[0].count || 0; // return count
      })

      .nodeify(callback);
  }

  remove(selector, options, callback) {
    // validate selector
    if (_.isFunction(selector)) {
      callback = selector;
      selector = undefined;
      options = {};
    } else if (!(
      _.isUndefined(selector) ||
      _.isBoolean(selector) ||
      _.isNumber(selector) ||
      _.isString(selector) ||
      _.isDate(selector) ||
      _.isPlainObject(selector) ||
      _.isArray(selector) ||
      Buffer.isBuffer(selector)
    )) {
      throw new TypeError('Invalid "selector" argument; ' +
        'expected boolean, number, string, date, object, array or buffer ' +
        `received ${type(selector)}`);
    }

    // validate options
    if (_.isFunction(options)) {
      callback = options;
      options = {};
    } else if (_.isUndefined(options)) {
      options = {};
    } else if (!_.isObject(options)) {
      throw new TypeError(`Invalid "options" argument; expected object, received ${type(options)}`);
    }

    // parse input
    const collection = ['COLLECTION', ['KEY', this.name]];
    const selection = this.validateSelection(this.parseSelection(selector));
    const orderby = this.validateOrderBy(this.parseOrderBy(options.orderby));
    const limit = this.parseLimit(options.limit);

    // compile parameterized SQL query
    const query = compileRemoveQuery({
      collection,
      selection,
      orderby,
      limit,
    });

    // execute query
    return this.db.execute(query).nodeify(callback);
  }

  insert(records, options, callback) {
    let isRecordsObject = false;

    // validate records
    if (_.isPlainObject(records)) {
      isRecordsObject = true;
      records = [records]; // make sure records is array
    } else if (!_.isArray(records)) {
      throw new TypeError(`Invalid records argument; exprected object or array, received ${type(records)}`);
    }

    // validate options
    if (_.isFunction(options)) {
      callback = options;
      options = {};
    } else if (_.isUndefined(options)) {
      options = {};
    }

    // validate records content
    return Promise.map(records, (record) => this.schema.validate(record))

      // compile + run query
      .then((values) => {
        const collection = ['COLLECTION', ['KEY', this.name]];
        const keys = this.schema.getKeys();
        const ignore = options.ignore === true;

        const query = compileInsertQuery({
          collection,
          keys,
          values,
          ignore
        });

        // execute query
        return this.db.execute(query)

          // return record indices in db
          .then((result) => {
            const autoinc = this.schema.hasAutoIncPrimaryKey();

            return values.map((obj, i) => {
              // check if table has simple auto-inc primary key
              if (autoinc) {
                return { [this.schema.getPrimaryKey()[0]]: result.insertId + i };
              }

              // extract primary key from obj
              return _.pick(obj, this.schema.getPrimaryKey());
            });
          })

          // return object, if object was received
          .then((arr) => {
            if (isRecordsObject) return arr[0];
            return arr;
          });
      })

      .nodeify(callback);
  }

  upsert(records, options, callback) {
    let isRecordsObject = false;

    // validate records
    if (_.isPlainObject(records)) {
      isRecordsObject = true;
      records = [records]; // make sure records is array
    } else if (!_.isArray(records)) {
      throw new TypeError(`Invalid records argument; exprected object or array, received ${type(records)}`);
    }

    // validate options
    if (_.isFunction(options)) {
      callback = options;
      options = {};
    } else if (_.isUndefined(options)) {
      options = {};
    }

    // validate records
    return Promise.map(records, (record) => this.schema.validate(record))

      // compile + run query
      .then((values) => {
        const collection = ['COLLECTION', ['KEY', this.name]];
        const keys = this.schema.getKeys();
        const updateKeys = _.difference(keys, this.schema.getPrimaryKeys());

        const query = compileUpsertQuery({
          collection,
          keys,
          updateKeys,
          values,
        });

        // execute query
        return this.db.execute(query)

          // return record indices in db
          .then((result) => {
            const autoinc = this.schema.hasAutoIncPrimaryKey();
            let insertedRows = 0;

            return values.map((obj) => {
              // check if obj contains primary key
              const containsPrimaryKey = this.schema.getPrimaryKey().every((k) => {
                return obj.hasOwnProperty(k);
              });

              if (containsPrimaryKey) {
                return _.pick(obj, this.schema.getPrimaryKey());
              }

              // check if table has simple auto-inc primary key
              if (autoinc) {
                return { [this.schema.getPrimaryKey()[0]]: result.insertId + (insertedRows++) };
              }

              // return empty object by default
              return {};
            });
          })

          // return object, if object was received
          .then((arr) => {
            if (isRecordsObject) return arr[0];
            return arr;
          });
      })

      .nodeify(callback);
  }

  update(selector, payload, options, callback) {
    // validate payload
    if (!_.isPlainObject(payload)) {
      throw new TypeError(`Invalid "payload" argument; exprected plain object, received ${type(payload)}`);
    }

    // validate options
    if (_.isFunction(options)) {
      callback = options;
      options = {};
    } else if (_.isUndefined(options)) {
      options = {};
    }

    // validate values
    return Promise.resolve()

      .then(() => this.schema.validate(payload, _.keys(payload)))

      // parse input + compile query
      .then((attrs) => {
        const collection = ['COLLECTION', ['KEY', this.name]];
        const selection = this.validateSelection(this.parseSelection(selector));
        const orderby = this.validateOrderBy(this.parseOrderBy(options.orderby));
        const limit = this.parseLimit(options.limit);

        return compileUpdateQuery({
          attrs,
          collection,
          selection,
          orderby,
          limit,
        });
      })

      // execute query
      .then((query) => this.db.execute(query))

      // // compile find query
      // .then(() => {
      //   const collection = ['COLLECTION', ['KEY', this.name]];
      //   const projection = this.validateProjection(['PROJECTION', null]);
      //   const selection = this.validateSelection(this.parseSelection(selector));
      //   const orderby = this.validateOrderBy(this.parseOrderBy(options.orderby));
      //   const limit = this.parseLimit(options.limit);
      //   const offset = this.parseOffset(null);

      //   return compileFindQuery({collection, selection, projection, orderby, limit, offset});
      // })

      // // execute find query
      // .then((query) => {
      //   console.log(query);
      //   return this.db.query(query.sql, query.params);
      // })

      // // return record indices in db
      // .map((record) => _.pick(record, this.schema.primaryKey()))

      // .then((results) => {
      //   console.log(results);
      //   return results;
      // })

      .nodeify(callback);
  }

  /**
   * Reverse engineers the collection's schema from metadata retrieved from the database.
   * This function will update the collection's schema.
   * @param {Function<Error>} [callback] an optional callback function.
   * @return {Promise}
   */
  reverseEngineer(callback) {
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

    return this.db.execute({ sql, params })
      .then((metadata) => Schema.fromMetadata(metadata))
      .nodeify(callback);
  }

}

export default MySqlCollection;
