/* eslint-env node, mocha */

import { assert } from 'chai';
import Database from '../src/Database';

describe('Database', () => {
  const db = new Database({
    host: process.env.MYSQL_HOST,
    port: parseInt(process.env.MYSQL_PORT, 10),
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE
  });

  describe('#constructor()', () => {
    it('throws error when "database" property is absent', () => {
      assert.throws(() => new Database({ }), TypeError);
      assert.doesNotThrow(() => new Database({ database: 'str' }), TypeError);
    });

    it('throws error when "database" property is invalid', () => {
      assert.throws(() => new Database({ database: 123 }), TypeError);
      assert.throws(() => new Database({ database: true }), TypeError);
      assert.throws(() => new Database({ database: {} }), TypeError);
    });

    it('throws error when "host" property is invalid', () => {
      assert.throws(() => new Database({ database: 'str', host: 123 }), TypeError);
      assert.throws(() => new Database({ database: 'str', host: true }), TypeError);
      assert.throws(() => new Database({ database: 'str', host: {} }), TypeError);
    });

    it('throws error when "port" property is invalid', () => {
      assert.throws(() => new Database({ database: 'str', port: 'str' }), TypeError);
      assert.throws(() => new Database({ database: 'str', port: true }), TypeError);
      assert.throws(() => new Database({ database: 'str', port: {} }), TypeError);
    });

    it('throws error when "user" property is invalid', () => {
      assert.throws(() => new Database({ database: 'str', user: 123 }), TypeError);
      assert.throws(() => new Database({ database: 'str', user: true }), TypeError);
      assert.throws(() => new Database({ database: 'str', user: {} }), TypeError);
    });

    it('throws error when "password" property is invalid', () => {
      assert.throws(() => new Database({ database: 'str', password: 123 }), TypeError);
      assert.throws(() => new Database({ database: 'str', password: true }), TypeError);
      assert.throws(() => new Database({ database: 'str', password: {} }), TypeError);
    });
  });

  describe('#query()', () => {
    it('throws error when "sql" is unspecified', () => {
      assert.throws(() => db.execute(), TypeError);
    });

    it('throws error when "sql" is invalid', () => {
      assert.throws(() => db.execute(123), TypeError);
      assert.throws(() => db.execute(true), TypeError);
      assert.throws(() => db.execute({ }), TypeError);
      assert.throws(() => db.execute(null), TypeError);
    });

    it('throws error when "params" is invalid', () => {
      assert.throws(() => db.execute({ sql: 'SELECT 1;', params: 123 }), TypeError);
      assert.throws(() => db.execute({ sql: 'SELECT 1;', params: true }), TypeError);
      assert.throws(() => db.execute({ sql: 'SELECT 1;', params: 'str' }), TypeError);
      assert.throws(() => db.execute({ sql: 'SELECT 1;', params: null }), TypeError);
    });

    it('throws error when "options" is invalid', () => {
      assert.throws(() => db.execute({ sql: 'SELECT 1;', params: [] }, 123), TypeError);
      assert.throws(() => db.execute({ sql: 'SELECT 1;', params: [] }, true), TypeError);
      assert.throws(() => db.execute({ sql: 'SELECT 1;', params: [] }, 'str'), TypeError);
      assert.throws(() => db.execute({ sql: 'SELECT 1;', params: [] }, null), TypeError);
      assert.throws(() => db.execute({ sql: 'SELECT 1;', params: [] }, []), TypeError);
    });
  });

  describe('@connected', () => {
    before((done) => {
      db.connect(done);
    });

    after((done) => {
      db.disconnect(done);
    });

    describe('#isConnected', () => {
      it('equals true', () => {
        assert.strictEqual(db.isConnected, true);
      });
    });

    describe('#execute()', () => {
      it('returns records when supplied with sql', (done) => {
        const sql = 'SELECT id FROM `employees`;';

        db.execute({ sql })
          .then((records) => {
            assert.isArray(records);
            assert.isObject(records[0]);
            assert.property(records[0], 'id');
            done();
          });
      });

      it('returns records when supplied with sql + params', (done) => {
        const sql = 'SELECT id FROM `employees` WHERE firstname = ? AND lastname = ?;';
        const params = ['Jordan', 'Belfort'];

        db.execute({ sql, params })
          .then((records) => {
            assert.isArray(records);
            assert.isObject(records[0]);
            assert.property(records[0], 'id', 1);
            done();
          });
      });

      it('returns records when supplied with sql + params + options', (done) => {
        const sql = 'SELECT id FROM `employees` WHERE firstname = ? AND lastname = ?;';
        const params = ['Jordan', 'Belfort'];

        db.execute({ sql, params }, { nestTables: true })

          .then((records) => {
            assert.isArray(records);
            assert.isObject(records[0]);
            assert.isObject(records[0].employees);
            assert.property(records[0].employees, 'id', 1);
            done();
          });
      });

      it('returns records when supplied with sql + options', (done) => {
        const sql = 'SELECT 1 AS \'num\';';

        db.execute({ sql }, { nestTables: true })

          .then((records) => {
            assert.isArray(records);
            assert.isObject(records[0]);
            assert.isObject(records[0]['']);
            assert.property(records[0][''], 'num', 1);
            done();
          });
      });
    });
  });

  describe('@disconnected', () => {
    describe('#isConnected', () => {
      it('equals false', () => {
        assert.strictEqual(db.isConnected, false);
      });
    });
  });
});
