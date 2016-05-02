/* eslint-env node, mocha */

import { assert } from 'chai';
import Database from '../src/Database';

describe('Collection', () => {
  const db = new Database({
    host: process.env.MYSQL_HOST,
    port: parseInt(process.env.MYSQL_PORT, 10),
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE
  });

  const employees = db.collection('employees', {
    id: { type: 'integer', autoinc: true, min: 0 },
    firstname: { type: 'string', maxLength: 45, nullable: true },
    lastname: { type: 'string', maxLength: 45, nullable: true },
    age: { type: 'integer', min: 18, max: 100 },
  });

  employees.index({ id: 1 }, { type: 'primary' });

  before((done) => {
    db.connect(done);
  });

  after((done) => {
    db.disconnect(done);
  });

  describe('CRUD (+ count) operation', () => {
    let count;
    let pk;

    it('counts records', (done) => {
      employees.count()

        .then((n) => {
          assert.isNumber(n);
          assert.operator(n, '>=', 1);
          count = n;
        })

        .nodeify(done);
    });

    it('creates record', (done) => {
      employees.insert({ firstname: 'Donnie', lastname: 'Azoff', age: 36 })

        .then((result) => {
          assert.isObject(result);
          assert.isNumber(result.id);
          pk = result;
        })

        // count records to validate #add
        .then(() => {
          return employees.count();
        })

        .then((n) => {
          assert.strictEqual(n, count + 1);
          count = n;
        })

        .nodeify(done);
    });

    it('reads record (using primary key)', (done) => {
      employees.find(pk)

        .then((records) => {
          assert.isArray(records);
          assert.lengthOf(records, 1);
          assert.strictEqual(records[0].id, pk.id);
        })

        .nodeify(done);
    });

    it('updates record (using primary key)', (done) => {
      employees.update(pk, { age: 37 })

        // read employee to validate #update
        .then(() => {
          return employees.findOne(pk);
        })

        .then((record) => {
          assert.strictEqual(record.age, 37);
        })

        .nodeify(done);
    });

    it('deletes record (using primary key)', (done) => {
      employees.remove(pk)

        // count records to validate #del
        .then(() => {
          return employees.count();
        })

        .then((n) => {
          assert.strictEqual(n, count - 1);
        })

        .nodeify(done);
    });
  });

  describe('CRUD (+ count) operation on multiple records', () => {
    const values = [
      { firstname: 'Mr.', lastname: 'Doobs', age: 18 },
      { firstname: 'George', lastname: 'Fudge', age: 19 },
      { firstname: 'Jack', lastname: 'White', age: 20 }
    ];

    let pk;
    let count;

    it('counts records', (done) => {
      employees.count()

        .then((n) => {
          assert.isNumber(n);
          assert.operator(n, '>=', 1);
          count = n;
        })

        .nodeify(done);
    });

    it('creates records', (done) => {
      employees.insert(values)
        .then((result) => {
          assert.isArray(result);
          assert.lengthOf(result, 3);
          assert.isObject(result[0]);
          assert.property(result[0], 'id');
          pk = result;
        })

        // count records to validate #add
        .then(() => {
          return employees.count();
        })

        .then((n) => {
          assert.strictEqual(n, count + 3);
          count = n;
        })

        .nodeify(done);
    });

    it('updates records (using primary key)', (done) => {
      employees.update(pk, { age: 30 })
        // read employee to validate #update
        .then(() => {
          return employees.find(pk);
        })
        .each((record) => {
          assert.strictEqual(record.age, 30);
        })
        .return()
        .then(done)
        .catch(done);
    });


    it('deletes records (using primary key)', (done) => {
      employees.remove(pk)
        // count records to validate #del
        .then(() => {
          return employees.count();
        })
        .then((n) => {
          assert.strictEqual(n, count - 3);
        })
        .then(done)
        .catch(done);
    });
  });
});
