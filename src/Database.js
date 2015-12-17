import _ from 'lodash';
import Promise from 'bluebird';
import mysql from 'mysql';
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
  constructor(connectionProperties: Object) {
    // handle optional connection props
    connectionProperties = _.defaults(connectionProperties, {
      host: 'localhost',
      port: 3306,
      user: 'root',
      password: '',
      connectionLimit: 10
    });

    super(connectionProperties);

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

}

export default MySqlDatabase;
