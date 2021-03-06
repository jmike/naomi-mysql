import { Transform as TransformStream } from 'stream';
import Promise from 'bluebird';
import _ from 'lodash';
import mysql from 'mysql';
import type from 'type-of';
import Database from 'naomi/lib/Database';
import Schema from './Schema';
import Collection from './Collection';

class MySqlDatabase extends Database {

  /**
   * Creates a new Database instance with the designated properties.
   * @param {Object} connectionProperties connection properties
   * @param {string} connectionProperties.database the name of the database
   * @param {string} [connectionProperties.host=localhost] optional hostname; defaults to "localhost"
   * @param {number} [connectionProperties.port=3306] optional port number; defaults to 3306
   * @param {string} [connectionProperties.user=root] optional user name to access the database; defaults to "root"
   * @param {string} [connectionProperties.password] optional password to access the database; defaults to "" (empty string)
   * @param {number} [connectionProperties.connectionLimit=10] optional maximum number of connections to maintain in the pool
   * @throws {TypeError} if arguments are of invalid type
   * @constructor
   */
  constructor(connectionProperties) {
    // handle optional connection props
    connectionProperties = _.defaults(connectionProperties, {
      host: 'localhost',
      port: 3306,
      user: 'root',
      password: '',
      connectionLimit: 10
    });

    // validate connectionProperties
    if (!_.isString(connectionProperties.database)) {
      throw new TypeError('Invalid "database" property in "connectionProperties" argument; ' +
        `expected string, received ${type(connectionProperties.database)}`);
    }

    if (!_.isString(connectionProperties.host)) {
      throw new TypeError('Invalid "host" property in "connectionProperties" argument; ' +
        `expected string, received ${type(connectionProperties.host)}`);
    }

    if (!_.isInteger(connectionProperties.port)) {
      throw new TypeError('Invalid "port" property in "connectionProperties" argument; ' +
        `expected integer, received ${type(connectionProperties.port)}`);
    }

    if (!_.isString(connectionProperties.user)) {
      throw new TypeError('Invalid "user" property in "connectionProperties" argument; ' +
        `expected string, received ${type(connectionProperties.user)}`);
    }

    if (!_.isString(connectionProperties.password)) {
      throw new TypeError('Invalid "password" property in "connectionProperties" argument; ' +
        `expected string, received ${type(connectionProperties.password)}`);
    }

    if (!_.isInteger(connectionProperties.connectionLimit)) {
      throw new TypeError('Invalid "connectionLimit" property in "connectionProperties" argument; ' +
        `expected integer, received ${type(connectionProperties.connectionLimit)}`);
    }

    super(connectionProperties);

    this.name = connectionProperties.database;
    this._pool = null;
  }

  connect(callback) {
    // check if already connected
    if (this.isConnected) {
      return Promise.resolve().nodeify(callback);
    }

    // connect
    return Promise.try(() => {
      this._pool = mysql.createPool(this.connectionProperties);
    })

      .then(() => {
        this.isConnected = true;
        this.emit('connect');
      })

      .nodeify(callback);
  }

  disconnect(callback) {
    // check if already disconnected
    if (!this.isConnected) {
      return Promise.resolve().nodeify(callback);
    }

    // disconnect
    return new Promise((resolve, reject) => {
      this._pool.end((err) => {
        if (err) {
          reject(err);
          return; // exit
        }

        resolve();
      });
    })

      .then(() => {
        this.isConnected = false;
        this.emit('disconnect');
      })

      .nodeify(callback);
  }

  execute(query, options, callback) {
    // validate query argument
    if (!_.isObject(query)) {
      throw new TypeError(`Invalid "query" argument; expected object, received ${type(query)}`);
    }

    // set default query properties
    query = _.defaults(query, { params: [] });

    // validate query.sql property
    if (!_.isString(query.sql)) {
      throw new TypeError('Invalid "sql" property in "query" argument; ' +
        `expected string, received ${type(query.sql)}`);
    }

    // validate query.params property
    if (!_.isArray(query.params)) {
      throw new TypeError('Invalid "params" property in "query" argument; ' +
        `expected array, received ${type(query.params)}`);
    }

    // validate options
    if (_.isFunction(options)) {
      callback = options;
      options = {};
    } else if (_.isUndefined(options)) {
      options = {};
    } else if (!_.isPlainObject(options)) {
      throw new TypeError(`Invalid "options" argument; expected plain object, received ${type(options)}`);
    }

    // make sure db is connected
    if (!this.isConnected) {
      throw new Error('Database not connected');
    }

    // acquire new connection from pool
    return this._acquireConnection()

      // run query using connection
      .then((connection) => {
        return this._queryConnection(connection, query, options)

          // always release previously acquired connection
          .finally(() => {
            return this._releaseConnection(connection);
          });
      })

      .nodeify(callback);
  }

  executeStream(query, options = {}) {
    // validate query argument
    if (!_.isObject(query)) {
      throw new TypeError(`Invalid "query" argument; expected object, received ${type(query)}`);
    }

    // set default query properties
    query = _.defaults(query, { params: [] });

    // validate query.sql property
    if (!_.isString(query.sql)) {
      throw new TypeError('Invalid "sql" property in "query" argument; ' +
        `expected string, received ${type(query.sql)}`);
    }

    // validate query.params property
    if (!_.isArray(query.params)) {
      throw new TypeError('Invalid "params" property in "query" argument; ' +
        `expected array, received ${type(query.params)}`);
    }

    // validate options argument
    if (!_.isPlainObject(options)) {
      throw new TypeError(`Invalid "options" argument; expected plain object, received ${type(options)}`);
    }

    // set default options properties
    options = _.defaults(options, { highWaterMark: 5 });

    // make sure options.highWaterMark property is valid
    if (!_.isInteger(options.highWaterMark)) {
      throw new TypeError('Invalid "highWaterMark" property in "options" argument; ' +
        `expected integer, received ${type(options.highWaterMark)}`);
    }

    // make sure db is connected
    if (!this.isConnected) {
      throw new Error('Database not connected');
    }

    const ts = new TransformStream({
      objectMode: true,
      transform: (data, encoding, callback) => {
        callback(null, data);
      }
    });

    // acquire new connection from pool
    this._acquireConnection()

      // run query using connection
      .then((connection) => {
        connection.query(_.assign({}, _.omit(options, 'highWaterMark'), { sql: query.sql }), query.params)
          .stream({ highWaterMark: options.highWaterMark })
          .pipe(ts);

        // always release previously acquired connection
        return this._releaseConnection(connection);
      });

    return ts;
  }

  /**
   * Acquires the first available connection from the internal connection pool.
   * @return {Promise<Connection>}
   * @private
   */
  _acquireConnection() {
    return new Promise((resolve, reject) => {
      this._pool.getConnection((err, connection) => {
        if (err) {
          reject(err);
          return; // exit
        }

        resolve(connection);
      });
    });
  }

  /**
   * Releases the designated client and restores it in the internal connection pool.
   * @param {Connection} connection
   * @private
   */
  _releaseConnection(connection) {
    connection.release();
  }

  /**
   * Runs the given parameterized SQL statement to the supplied db connection.
   * @param {Connection} connection a db connection.
   * @param {string} sql a parameterized SQL statement.
   * @param {Array} [params] an array of parameter values.
   * @param {Object} [options] query options.
   * @return {Promise} resolving to the query results.
   * @private
   */
  _queryConnection(connection, query, options) {
    return new Promise((resolve, reject) => {
      connection.query(_.assign({}, options, { sql: query.sql }), query.params, (err, records) => {
        if (err) {
          reject(err);
          return; // exit
        }

        // handle SELECT statement response
        if (_.isArray(records)) {
          resolve(records);
          return; // exit
        }

        // handle DML statement response
        resolve({
          insertId: records.insertId,
          affectedRows: records.affectedRows
        });
      });
    });
  }

  schema(definition) {
    return new Schema(definition);
  }

  collection(name, schema = {}) {
    return new Collection(this, name, schema);
  }

}

export default MySqlDatabase;
