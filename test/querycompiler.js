/* global describe, it, before, after */

import {assert} from 'chai';
import QueryCompiler from '../src/QueryCompiler';

describe('QueryCompiler', function () {
  const builder = new QueryCompiler('employees', ['id', 'firstname', 'lastname', 'age']);

  describe('#compileKey()', function () {
    it('accepts valid AST', function () {
      const query = builder.compileKey(['KEY', 'id']);

      assert.strictEqual(query.sql, '`id`');
      assert.lengthOf(query.params, 0);
    });
  });

  describe('#compileOrderBy()', function () {
    it('accepts valid AST', function () {
      const query = builder.compileOrderBy([
        'ORDERBY',
        ['ASC', ['KEY', 'name']],
        ['DESC', ['KEY', 'age']]
      ]);

      assert.strictEqual(query.sql, '`name` ASC, `age` DESC');
      assert.lengthOf(query.params, 0);
    });
  });

  describe('#compileSelection()', function () {
    it('accepts AST with nil arguments', function () {
      const query = builder.compileSelection(['SELECTION', null]);

      assert.strictEqual(query.sql, '');
      assert.deepEqual(query.params, []);
    });

    it('accepts AST containing $eq', function () {
      const query = builder.compileSelection([
        'SELECTION',
        ['EQ', ['KEY', 'age'], ['VALUE', 23]]
      ]);

      assert.strictEqual(query.sql, '`age` = ?');
      assert.deepEqual(query.params, [23]);
    });

    it('accepts AST containing $eq with null value', function () {
      const query = builder.compileSelection([
        'SELECTION',
        ['EQ', ['KEY', 'age'], ['VALUE', null]]
      ]);

      assert.strictEqual(query.sql, '`age` IS NULL');
      assert.deepEqual(query.params, []);
    });

    it('accepts AST containing $ne', function () {
      const query = builder.compileSelection([
        'SELECTION',
        ['NE', ['KEY', 'age'], ['VALUE', 23]]
      ]);

      assert.strictEqual(query.sql, '`age` != ?');
      assert.deepEqual(query.params, [23]);
    });

    it('accepts AST containing $ne with null value', function () {
      const query = builder.compileSelection([
        'SELECTION',
        ['NE', ['KEY', 'age'], ['VALUE', null]]
      ]);

      assert.strictEqual(query.sql, '`age` IS NOT NULL');
      assert.deepEqual(query.params, []);
    });

    it('accepts AST containing $gt', function () {
      const query = builder.compileSelection([
        'SELECTION',
        ['GT', ['KEY', 'age'], ['VALUE', 23]]
      ]);

      assert.strictEqual(query.sql, '`age` > ?');
      assert.deepEqual(query.params, [23]);
    });

    it('accepts AST containing $gte', function () {
      const query = builder.compileSelection([
        'SELECTION',
        ['GTE', ['KEY', 'age'], ['VALUE', 23]]
      ]);

      assert.strictEqual(query.sql, '`age` >= ?');
      assert.deepEqual(query.params, [23]);
    });

    it('accepts AST containing $lt', function () {
      const query = builder.compileSelection([
        'SELECTION',
        ['LT', ['KEY', 'age'], ['VALUE', 23]]
      ]);

      assert.strictEqual(query.sql, '`age` < ?');
      assert.deepEqual(query.params, [23]);
    });

    it('accepts AST containing $lte', function () {
      const query = builder.compileSelection([
        'SELECTION',
        ['LTE', ['KEY', 'age'], ['VALUE', 23]]
      ]);

      assert.strictEqual(query.sql, '`age` <= ?');
      assert.deepEqual(query.params, [23]);
    });

    it('accepts AST containing $in', function () {
      const query = builder.compileSelection([
        'SELECTION',
        ['IN', ['KEY', 'age'], ['VALUES', 20, 30, 40]]
      ]);

      assert.strictEqual(query.sql, '`age` IN (?, ?, ?)');
      assert.deepEqual(query.params, [20, 30, 40]);
    });

    it('accepts AST containing $nin', function () {
      const query = builder.compileSelection([
        'SELECTION',
        ['NIN', ['KEY', 'age'], ['VALUES', 20, 30, 40]]
      ]);

      assert.strictEqual(query.sql, '`age` NOT IN (?, ?, ?)');
      assert.deepEqual(query.params, [20, 30, 40]);
    });

    it('accepts AST containing $like', function () {
      const query = builder.compileSelection([
        'SELECTION',
        ['LIKE', ['KEY', 'firstname'], ['VALUE', '%ohn']]
      ]);

      assert.strictEqual(query.sql, '`firstname` LIKE ?');
      assert.deepEqual(query.params, ['%ohn']);
    });

    it('accepts AST containing $nlike', function () {
      const query = builder.compileSelection([
        'SELECTION',
        ['NLIKE', ['KEY', 'firstname'], ['VALUE', '%ohn']]
      ]);

      assert.strictEqual(query.sql, '`firstname` NOT LIKE ?');
      assert.deepEqual(query.params, ['%ohn']);
    });

    it('accepts AST containing $and', function () {
      const query = builder.compileSelection([
        'SELECTION',
        ['AND',
          ['EQ', ['KEY', 'age'], ['VALUE', 23]],
          ['NE', ['KEY', 'firstname'], ['VALUE', 'John']]
        ]
      ]);

      assert.strictEqual(query.sql, '(`age` = ?) AND (`firstname` != ?)');
      assert.deepEqual(query.params, [23, 'John']);
    });

    it('accepts AST containing $or', function () {
      const query = builder.compileSelection([
        'SELECTION',
        ['OR',
          ['EQ', ['KEY', 'age'], ['VALUE', 23]],
          ['NE', ['KEY', 'firstname'], ['VALUE', 'John']]
        ]
      ]);

      assert.strictEqual(query.sql, '(`age` = ?) OR (`firstname` != ?)');
      assert.deepEqual(query.params, [23, 'John']);
    });

    it('accepts AST containing $and with nested $or', function () {
      const query = builder.compileSelection([
        'SELECTION',
        ['AND',
          ['OR',
            ['EQ', ['KEY', 'age'], ['VALUE', 18]],
            ['EQ', ['KEY', 'age'], ['VALUE', 23]]
          ],
          ['NE', ['KEY', 'firstname'], ['VALUE', 'James']]
        ]
      ]);

      assert.strictEqual(query.sql, '((`age` = ?) OR (`age` = ?)) AND (`firstname` != ?)');
      assert.deepEqual(query.params, [18, 23, 'James']);
    });
  });

  describe('#compileProjection()', function () {
    it('accepts AST with nil arguments', function () {
      const query = builder.compileProjection(['PROJECTION', null]);

      assert.strictEqual(query.sql, '`id`, `firstname`, `lastname`, `age`');
      assert.deepEqual(query.params, []);
    });

    it('accepts AST with exclude arguments', function () {
      const query = builder.compileProjection([
        'PROJECTION',
        ['EXCLUDE', ['KEY', 'age']],
        ['EXCLUDE', ['KEY', 'id']]
      ]);

      assert.strictEqual(query.sql, '`firstname`, `lastname`');
      assert.deepEqual(query.params, []);
    });

    it('accepts AST with include arguments', function () {
      const query = builder.compileProjection([
        'PROJECTION',
        ['INCLUDE', ['KEY', 'firstname']],
        ['INCLUDE', ['KEY', 'lastname']]
      ]);

      assert.strictEqual(query.sql, '`firstname`, `lastname`');
      assert.deepEqual(query.params, []);
    });

    it('accepts AST with include and exclude arguments', function () {
      const query = builder.compileProjection([
        'PROJECTION',
        ['EXCLUDE', ['KEY', 'age']],
        ['EXCLUDE', ['KEY', 'id']],
        ['INCLUDE', ['KEY', 'firstname']],
        ['INCLUDE', ['KEY', 'lastname']]
      ]);

      assert.strictEqual(query.sql, '`firstname`, `lastname`');
      assert.deepEqual(query.params, []);
    });

    it('accepts AST with overlapping include and exclude arguments', function () {
      const query = builder.compileProjection([
        'PROJECTION',
        ['INCLUDE', ['KEY', 'firstname']],
        ['INCLUDE', ['KEY', 'lastname']],
        ['INCLUDE', ['KEY', 'age']],
        ['EXCLUDE', ['KEY', 'age']],
      ]);

      assert.strictEqual(query.sql, '`firstname`, `lastname`');
      assert.deepEqual(query.params, []);
    });

    it('throws error in include and exclude directives in the AST cancel each other out', function () {
      assert.throws(() => {
        builder.compileProjection([
          'PROJECTION',
          ['INCLUDE', ['KEY', 'age']],
          ['EXCLUDE', ['KEY', 'age']],
        ]);
      }, Error);
    });
  });

  describe('#compileFind()', function () {
    it('accepts AST with nil arguments', function () {
      const query = builder.compileFind({
        projection: ['PROJECTION', null],
        selection: ['SELECTION', null],
        orderby: ['ORDERBY', null],
        limit: ['LIMIT', null],
        offset: ['OFFSET', null]
      });

      assert.strictEqual(query.sql, 'SELECT `id`, `firstname`, `lastname`, `age` FROM `employees`;');
      assert.deepEqual(query.params, []);
    });

    it('accepts AST with projection, selection, order by, limit and offset', function () {
      const query = builder.compileFind({
        projection: [
          'PROJECTION',
          ['INCLUDE', ['KEY', 'firstname']],
          ['INCLUDE', ['KEY', 'lastname']]
        ],
        selection: [
          'SELECTION',
          ['EQ', ['KEY', 'age'], ['VALUE', 23]]
        ],
        orderby: [
          'ORDERBY',
          ['ASC', ['KEY', 'firstname']],
          ['DESC', ['KEY', 'id']]
        ],
        limit: ['LIMIT', 10],
        offset: ['OFFSET', 20]
      });

      assert.strictEqual(query.sql, 'SELECT `firstname`, `lastname` FROM `employees` WHERE `age` = ? ORDER BY `firstname` ASC, `id` DESC LIMIT 10 OFFSET 20;');
      assert.deepEqual(query.params, [23]);
    });
  });

  describe('#compileCount()', function () {
    it('accepts AST with selection, order by, limit and offset', function () {
      const query = builder.compileCount({
        selection: [
          'SELECTION',
          ['EQ', ['KEY', 'age'], ['VALUE', 23]]
        ],
        orderby: [
          'ORDERBY',
          ['ASC', ['KEY', 'firstname']],
          ['DESC', ['KEY', 'id']]
        ],
        limit: ['LIMIT', 10],
        offset: ['OFFSET', 20]
      });

      assert.strictEqual(query.sql, 'SELECT COUNT(*) AS `count` FROM `employees` WHERE `age` = ? ORDER BY `firstname` ASC, `id` DESC LIMIT 10 OFFSET 20;');
      assert.deepEqual(query.params, [23]);
    });
  });

  describe('#compileRemove()', function () {
    it('accepts AST with selection, order by and limit', function () {
      const query = builder.compileRemove({
        selection: [
          'SELECTION',
          ['EQ', ['KEY', 'age'], ['VALUE', 23]]
        ],
        orderby: [
          'ORDERBY',
          ['ASC', ['KEY', 'firstname']],
          ['DESC', ['KEY', 'id']]
        ],
        limit: ['LIMIT', 10]
      });

      assert.strictEqual(query.sql, 'DELETE FROM `employees` WHERE `age` = ? ORDER BY `firstname` ASC, `id` DESC LIMIT 10;');
      assert.deepEqual(query.params, [23]);
    });
  });

  // describe('#buildFind()', function () {
  //   const db = new Database({
  //     host: process.env.MYSQL_HOST,
  //     port: parseInt(process.env.MYSQL_PORT, 10),
  //     user: process.env.MYSQL_USER,
  //     password: process.env.MYSQL_PASSWORD,
  //     database: process.env.MYSQL_DATABASE
  //   });
  //   const employees = db.createCollection('employees');
  //   const builder = new QueryCompiler(employees);

  //   it('accepts empty AST', function () {
  //     const query = builder.buildFind([]);

  //     assert.strictEqual(query.sql, 'SELECT * FROM `employees`;');
  //     assert.lengthOf(query.params, 0);
  //   });

  //   it('accepts EQ operators in the AST', function () {
  //     const query = builder.buildFind([
  //       'EQ',
  //       ['KEY', 'a'],
  //       ['VALUE', 1]
  //     ]);

  //     assert.strictEqual(query.sql, 'SELECT * FROM `employees` WHERE `a` = ?;');
  //     assert.sameMembers(query.params, [1]);
  //   });
  // });
});
