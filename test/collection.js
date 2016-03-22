/* global describe, it, before, after */

import {assert} from 'chai';
import Promise from 'bluebird';
import Database from '../src/Database';
import Collection from '../src/Collection';

describe('Collection', function () {
  const db = new Database({
    host: process.env.MYSQL_HOST,
    port: parseInt(process.env.MYSQL_PORT, 10),
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE
  });

  const employees = db.collection('employees', {
    id: {type: 'integer', autoinc: true, min: 0},
    firstname: {type: 'string', maxLength: 45, nullable: true},
    lastname: {type: 'string', maxLength: 45, nullable: true},
    age: {type: 'integer', min: 18, max: 100},
  });

  employees.index({id: 1}, {type: 'primary'});

  before(function (done) {
    db.connect(done);
  });

  after(function (done) {
    db.disconnect(done);
  });

  describe('performs CRUD (+ count) cycle', function () {
    let count;
    let pk;

    it('counts records', function (done) {
      employees.count()

        .then(function (n) {
          assert.isNumber(n);
          assert.operator(n, '>=', 1);
          count = n;
        })

        .then(done)
        .catch(done);
    });

    it('creates record', function (done) {
      employees.insert({firstname: 'Donnie', lastname: 'Azoff', age: 36})
        .then(function (result) {
          assert.isObject(result);
          assert.isNumber(result.id);
          pk = result;
        })
        // count records to validate #add
        .then(function () {
          return employees.count();
        })
        .then(function (n) {
          assert.strictEqual(n, count + 1);
          count = n;
        })
        .then(done)
        .catch(done);
    });

    it('reads record (using primary key)', function (done) {
      employees.find(pk)
        .then(function (records) {
          assert.isArray(records);
          assert.lengthOf(records, 1);
          assert.strictEqual(records[0].id, pk.id);
        })
        .then(done)
        .catch(done);
    });

    it('updates record (using primary key)', function (done) {
      employees.update(pk, {age: 37})
        // read employee to validate #update
        .then(function () {
          return employees.findOne(pk);
        })
        .then(function (record) {
          assert.strictEqual(record.age, 37);
        })
        .then(done)
        .catch(done);
    });

    it('deletes record (using primary key)', function (done) {
      employees.remove(pk)
        // count records to validate #del
        .then(function () {
          return employees.count();
        })
        .then(function (n) {
          assert.strictEqual(n, count - 1);
        })
        .then(done)
        .catch(done);
    });
  });

  describe('performs CRUD (+ count) cycle for multiple records', function () {
    const values = [
      {firstname: 'Mr.', lastname: 'Doobs', age: 18},
      {firstname: 'George', lastname: 'Fudge', age: 19},
      {firstname: 'Jack', lastname: 'White', age: 20}
    ];

    let pk;
    let count;

    it('counts records', function (done) {
      employees.count()
        .then(function (n) {
          assert.isNumber(n);
          assert.operator(n, '>=', 1);
          count = n;
        })
        .then(done)
        .catch(done);
    });

    it('creates records', function (done) {
      employees.insert(values)
        .then(function (result) {
          assert.isArray(result);
          assert.lengthOf(result, 3);
          assert.isObject(result[0]);
          assert.property(result[0], 'id');
          pk = result;
        })
        // count records to validate #add
        .then(function () {
          return employees.count();
        })
        .then(function (n) {
          assert.strictEqual(n, count + 3);
          count = n;
        })
        .then(done)
        .catch(done);
    });

    it('updates records (using primary key)', function (done) {
      employees.update(pk, {age: 30})
        // read employee to validate #update
        .then(function () {
          return employees.find(pk);
        })
        .each(function (record) {
          assert.strictEqual(record.age, 30);
        })
        .return()
        .then(done)
        .catch(done);
    });


    it('deletes records (using primary key)', function (done) {
      employees.remove(pk)
        // count records to validate #del
        .then(function () {
          return employees.count();
        })
        .then(function (n) {
          assert.strictEqual(n, count - 3);
        })
        .then(done)
        .catch(done);
    });
  });
});
