import _ from 'lodash';
import Promise from 'bluebird';
import mysql from 'mysql';
import type from 'type-of';
import {Database} from 'naomi';

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
  constructor(connectionProperties: {database: string, host: ?string, port: ?number, user: ?string, password: ?string, connectionLimit: ?number}) {
    // handle optional connection props
    connectionProperties = _.defaults(connectionProperties, {
      host: 'localhost',
      port: 3306,
      user: 'root',
      password: '',
      connectionLimit: 10
    });

    super(connectionProperties);

    this.name = connectionProperties.database;
    this._pool = null;
  }

  /**
   * Connects to the database using the connection properties specified at construction time.
   * @param {Function<err>} [callback] an optional callback function.
   * @returns {Promise} a bluebird promise
   * @throws {TypeError} if arguments are of invalid type
   * @emits Database#connect
   */
  connect(callback: ?Function): Promise {
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


  /**
   * Disconnects from the database.
   * Please note: the database instance will become practically useless after calling this method.
   * @param {Function<Error>} [callback] an optional callback function.
   * @returns {Promise} a bluebird promise
   * @throws {TypeError} if arguments are of invalid type
   * @emits Database#disconnect
   */
  disconnect(callback: ?Function): Promise {
    // check if already disconnected
    if (!this.isConnected) {
      return Promise.resolve().nodeify(callback);
    }

    // disconnect
    return new Promise((resolve, reject) => {
      this._pool.end((err) => {
        if (err) return reject(err);
        resolve();
      });
    })

      .then(() => {
        this.isConnected = false;
        this.emit('disconnect');
      })

      .nodeify(callback);
  }

  /**
   * Runs the given parameterized SQL statement.
   * @param {string} sql the SQL statement.
   * @param {Array} [params] an array of parameter values.
   * @param {Object} [options] query options.
   * @param {Function} [callback] a callback function with (err, records) arguments.
   * @returns {Promise} a bluebird promise resolving to the query results.
   * @throws {TypeError} if arguments are of invalid type
   */
  query(sql: string, params: ?Object | Function, options: ?Object | Function, callback: ?Function): Promise {
    // handle optional arguments
    if (_.isFunction(params)) {
      callback = params;
      options = {};
      params = [];
    } else if (_.isPlainObject(params)) {
      options = params;
      params = [];
    } else if (_.isUndefined(params)) {
      params = [];
    } else if (!_.isArray(params)) {
      throw new TypeError(`Invalid params argument; expected array, received ${type(params)}`);
    }

    if (_.isFunction(options)) {
      callback = options;
      options = {};
    } else if (_.isUndefined(options)) {
      options = {};
    } else if (!_.isPlainObject(options)) {
      throw new TypeError(`Invalid options argument; expected plain object, received ${type(options)}`);
    }

    // make sure db is connected
    return Promise.resolve(this._awaitConnect())

      // acquire new connection from pool
      .then(() => this._acquireConnection())

      // run query using connection
      .then((connection) => {
        return this._queryConnection(connection, sql, params, options)

          // always release previously acquired connection
          .finally(() => {
            return this._releaseConnection(connection);
          });
      })

      .nodeify(callback);
  }

  /**
   * Acquires the first available connection from the internal connection pool.
   * @return {Promise<Connection>}
   * @private
   */
  _acquireConnection() {
    return new Promise((resolve, reject) => {
      this._pool.getConnection((err, connection) => {
        if (err) return reject(err);
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
  _queryConnection(connection, sql, params, options) {
    // merge options + sql
    options.sql = sql;

    // promisify query logic
    return new Promise((resolve, reject) => {
      connection.query(options, params, (err, records) => {
        if (err) return reject(err);

        // handle SELECT statement response
        if (_.isArray(records)) {
          return resolve(records); // exit
        }

        // handle DML statement response
        resolve({
          insertId: records.insertId,
          affectedRows: records.affectedRows
        });
      });
    });
  }

}

export default MySqlDatabase;
