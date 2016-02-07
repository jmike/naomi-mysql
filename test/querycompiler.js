/* global describe, it, before, after */

import {assert} from 'chai';
import QueryCompiler from '../src/QueryCompiler';

describe('QueryCompiler', function () {
  const builder = new QueryCompiler('employees');

  describe('#compileKey()', function () {
    it('accepts valid AST', function () {
      const query = builder.compileKey(['KEY', 'a']);

      assert.strictEqual(query.sql, '`a`');
      assert.lengthOf(query.params, 0);
    });
  });

  describe('#compileOrderBy()', function () {
    it('accepts valid AST', function () {
      const query = builder.compileOrderBy([
        'ORDERBY',
        ['ASC', ['KEY', 'foo']],
        ['DESC', ['KEY', 'bar']]
      ]);

      assert.strictEqual(query.sql, '`foo` ASC, `bar` DESC');
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
        ['EQ', ['KEY', 'foo'], ['VALUE', 123]]
      ]);

      assert.strictEqual(query.sql, '`foo` = ?');
      assert.deepEqual(query.params, [123]);
    });

    it('accepts AST containing $eq with null value', function () {
      const query = builder.compileSelection([
        'SELECTION',
        ['EQ', ['KEY', 'foo'], ['VALUE', null]]
      ]);

      assert.strictEqual(query.sql, '`foo` IS NULL');
      assert.deepEqual(query.params, []);
    });

    it('accepts AST containing $ne', function () {
      const query = builder.compileSelection([
        'SELECTION',
        ['NE', ['KEY', 'foo'], ['VALUE', 123]]
      ]);

      assert.strictEqual(query.sql, '`foo` != ?');
      assert.deepEqual(query.params, [123]);
    });

    it('accepts AST containing $ne with null value', function () {
      const query = builder.compileSelection([
        'SELECTION',
        ['NE', ['KEY', 'foo'], ['VALUE', null]]
      ]);

      assert.strictEqual(query.sql, '`foo` IS NOT NULL');
      assert.deepEqual(query.params, []);
    });

    it('accepts AST containing $gt', function () {
      const query = builder.compileSelection([
        'SELECTION',
        ['GT', ['KEY', 'foo'], ['VALUE', 123]]
      ]);

      assert.strictEqual(query.sql, '`foo` > ?');
      assert.deepEqual(query.params, [123]);
    });

    it('accepts AST containing $gte', function () {
      const query = builder.compileSelection([
        'SELECTION',
        ['GTE', ['KEY', 'foo'], ['VALUE', 123]]
      ]);

      assert.strictEqual(query.sql, '`foo` >= ?');
      assert.deepEqual(query.params, [123]);
    });

    it('accepts AST containing $lt', function () {
      const query = builder.compileSelection([
        'SELECTION',
        ['LT', ['KEY', 'foo'], ['VALUE', 123]]
      ]);

      assert.strictEqual(query.sql, '`foo` < ?');
      assert.deepEqual(query.params, [123]);
    });

    it('accepts AST containing $lte', function () {
      const query = builder.compileSelection([
        'SELECTION',
        ['LTE', ['KEY', 'foo'], ['VALUE', 123]]
      ]);

      assert.strictEqual(query.sql, '`foo` <= ?');
      assert.deepEqual(query.params, [123]);
    });

    it('accepts AST containing $in', function () {
      const query = builder.compileSelection([
        'SELECTION',
        ['IN', ['KEY', 'foo'], ['VALUES', 1, 2, 3]]
      ]);

      assert.strictEqual(query.sql, '`foo` IN (?, ?, ?)');
      assert.deepEqual(query.params, [1, 2, 3]);
    });

    it('accepts AST containing $nin', function () {
      const query = builder.compileSelection([
        'SELECTION',
        ['NIN', ['KEY', 'foo'], ['VALUES', 1, 2, 3]]
      ]);

      assert.strictEqual(query.sql, '`foo` NOT IN (?, ?, ?)');
      assert.deepEqual(query.params, [1, 2, 3]);
    });

    it('accepts AST containing $like', function () {
      const query = builder.compileSelection([
        'SELECTION',
        ['LIKE', ['KEY', 'foo'], ['VALUE', '%str']]
      ]);

      assert.strictEqual(query.sql, '`foo` LIKE ?');
      assert.deepEqual(query.params, ['%str']);
    });

    it('accepts AST containing $nlike', function () {
      const query = builder.compileSelection([
        'SELECTION',
        ['NLIKE', ['KEY', 'foo'], ['VALUE', '%str']]
      ]);

      assert.strictEqual(query.sql, '`foo` NOT LIKE ?');
      assert.deepEqual(query.params, ['%str']);
    });

    it('accepts AST containing $and', function () {
      const query = builder.compileSelection([
        'SELECTION',
        ['AND',
          ['EQ', ['KEY', 'foo'], ['VALUE', 123]],
          ['NE', ['KEY', 'bar'], ['VALUE', 'str']]
        ]
      ]);

      assert.strictEqual(query.sql, '(`foo` = ?) AND (`bar` != ?)');
      assert.deepEqual(query.params, [123, 'str']);
    });

    it('accepts AST containing $or', function () {
      const query = builder.compileSelection([
        'SELECTION',
        ['OR',
          ['EQ', ['KEY', 'foo'], ['VALUE', 123]],
          ['NE', ['KEY', 'bar'], ['VALUE', 'str']]
        ]
      ]);

      assert.strictEqual(query.sql, '(`foo` = ?) OR (`bar` != ?)');
      assert.deepEqual(query.params, [123, 'str']);
    });

    it('accepts AST containing $and with nested $or', function () {
      const query = builder.compileSelection([
        'SELECTION',
        ['AND',
          ['OR',
            ['EQ', ['KEY', 'foo'], ['VALUE', 1]],
            ['EQ', ['KEY', 'foo'], ['VALUE', 2]]
          ],
          ['NE', ['KEY', 'bar'], ['VALUE', 'str']]
        ]
      ]);

      assert.strictEqual(query.sql, '((`foo` = ?) OR (`foo` = ?)) AND (`bar` != ?)');
      assert.deepEqual(query.params, [1, 2, 'str']);
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
