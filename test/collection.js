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

  const employees = db.createCollection('employees', {
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

  describe('CRUD + count operation', function () {
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
  });
});
