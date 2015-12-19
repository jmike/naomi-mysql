/* global describe, it, before, after */

import {assert} from 'chai';
import Promise from 'bluebird';
import Database from '../src/Database';

describe('Database', function () {
  const db = new Database({
    host: process.env.MYSQL_HOST,
    port: parseInt(process.env.MYSQL_PORT, 10),
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE
  });

  describe('#constructor()', function () {
    it('throws error when "database" property is absent', function () {
      assert.throws(() => new Database({}), TypeError);
      assert.doesNotThrow(() => new Database({database: 'str'}), TypeError);
    });

    it('throws error when "database" property is invalid', function () {
      assert.throws(() => new Database({database: 123}), TypeError);
      assert.throws(() => new Database({database: true}), TypeError);
      assert.throws(() => new Database({database: {}}), TypeError);
    });

    it('throws error when "host" property is invalid', function () {
      assert.throws(() => new Database({database: 'str', host: 123}), TypeError);
      assert.throws(() => new Database({database: 'str', host: true}), TypeError);
      assert.throws(() => new Database({database: 'str', host: {}}), TypeError);
    });

    it('throws error when "port" property is invalid', function () {
      assert.throws(() => new Database({database: 'str', port: 'str'}), TypeError);
      assert.throws(() => new Database({database: 'str', port: true}), TypeError);
      assert.throws(() => new Database({database: 'str', port: {}}), TypeError);
    });

    it('throws error when "user" property is invalid', function () {
      assert.throws(() => new Database({database: 'str', user: 123}), TypeError);
      assert.throws(() => new Database({database: 'str', user: true}), TypeError);
      assert.throws(() => new Database({database: 'str', user: {}}), TypeError);
    });

    it('throws error when "password" property is invalid', function () {
      assert.throws(() => new Database({database: 'str', password: 123}), TypeError);
      assert.throws(() => new Database({database: 'str', password: true}), TypeError);
      assert.throws(() => new Database({database: 'str', password: {}}), TypeError);
    });
  });

  describe('#query()', function () {
    it('throws error when "sql" is unspecified', function () {
      assert.throws(() => db.query(), TypeError);
    });

    it('throws error when "sql" is invalid', function () {
      assert.throws(() => db.query(123), TypeError);
      assert.throws(() => db.query(true), TypeError);
      assert.throws(() => db.query({}), TypeError);
      assert.throws(() => db.query(null), TypeError);
    });

    it('throws error when "params" is invalid', function () {
      assert.throws(() => db.query('SELECT 1;', 123), TypeError);
      assert.throws(() => db.query('SELECT 1;', true), TypeError);
      assert.throws(() => db.query('SELECT 1;', 'str'), TypeError);
      assert.throws(() => db.query('SELECT 1;', null), TypeError);
    });

    it('throws error when "options" is invalid', function () {
      assert.throws(() => db.query('SELECT 1;', [], 123), TypeError);
      assert.throws(() => db.query('SELECT 1;', [], true), TypeError);
      assert.throws(() => db.query('SELECT 1;', [], 'str'), TypeError);
      assert.throws(() => db.query('SELECT 1;', [], null), TypeError);
      assert.throws(() => db.query('SELECT 1;', [], []), TypeError);
    });
  });

  describe('@connected', function () {
    before(function (done) {
      db.connect(done);
    });

    after(function (done) {
      db.disconnect(done);
    });

    describe('#isConnected', function () {
      it('equals true', function () {
        assert.strictEqual(db.isConnected, true);
      });
    });

    describe('#query()', function () {
      it('returns records when supplied with sql', function (done) {
        const sql = 'SELECT id FROM `employees`;';

        db.query(sql)
          .then(function (records) {
            assert.isArray(records);
            assert.isObject(records[0]);
            assert.property(records[0], 'id');
            done();
          });
      });

      it('returns records when supplied with sql + params', function (done) {
        const sql = 'SELECT id FROM `employees` WHERE firstname = ? AND lastname = ?;';
        const params = ['Jordan', 'Belfort'];

        db.query(sql, params)
          .then(function (records) {
            assert.isArray(records);
            assert.isObject(records[0]);
            assert.property(records[0], 'id', 1);
            done();
          });
      });

      it('returns records when supplied with sql + params + options', function (done) {
        const sql = 'SELECT id FROM `employees` WHERE firstname = ? AND lastname = ?;';
        const params = ['Jordan', 'Belfort'];

        db.query(sql, params, {nestTables: true})
          .then(function (records) {
            assert.isArray(records);
            assert.isObject(records[0]);
            assert.isObject(records[0].employees);
            assert.property(records[0].employees, 'id', 1);
            done();
          });
      });

      it('returns records when supplied with sql + options', function (done) {
        const sql = 'SELECT 1 AS \'num\';';

        db.query(sql, {nestTables: true})
          .then(function (records) {
            assert.isArray(records);
            assert.isObject(records[0]);
            assert.isObject(records[0]['']);
            assert.property(records[0][''], 'num', 1);
            done();
          });
      });
    });
  });

  describe('@disconnected', function () {
    describe('#isConnected', function () {
      it('equals false', function () {
        assert.strictEqual(db.isConnected, false);
      });
    });
  });
});
