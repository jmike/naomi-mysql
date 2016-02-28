/* global describe, it, before, after */

import {assert} from 'chai';
import QueryCompiler from '../src/QueryCompiler';
import {Schema} from 'naomi';

describe('QueryCompiler', function () {
  const builder = new QueryCompiler('employees', new Schema({
    'id': {type: 'integer'},
    'firstname': {type: 'string'},
    'lastname': {type: 'string'},
    'age': {type: 'integer'}
  }));

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

  describe('#compileFindQuery()', function () {
    it('accepts $query with null projection, selection, orderby, limit and offset', function () {
      const query = builder.compileFindQuery({
        projection: ['PROJECTION', null],
        selection: ['SELECTION', null],
        orderby: ['ORDERBY', null],
        limit: ['LIMIT', null],
        offset: ['OFFSET', null]
      });

      assert.strictEqual(query.sql, 'SELECT `id`, `firstname`, `lastname`, `age` FROM `employees`;');
      assert.deepEqual(query.params, []);
    });

    it('accepts $query with projection, selection, orderby, limit and offset', function () {
      const query = builder.compileFindQuery({
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

  describe('#compileCountQuery()', function () {
    it('accepts $query with selection, orderby, limit and offset', function () {
      const query = builder.compileCountQuery({
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

  describe('#compileRemoveQuery()', function () {
    it('accepts $query with selection, orderby and limit', function () {
      const query = builder.compileRemoveQuery({
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

  describe('#compileInsertQuery()', function () {
    it('accepts $query with records', function () {
      const query = builder.compileInsertQuery({
        records: [
          {firstname: 'Jack', lastname: 'Sparrow', age: 34},
          {firstname: 'Will', lastname: 'Turner', age: 27}
        ]
      });

      assert.strictEqual(query.sql, 'INSERT INTO `employees` (`id`, `firstname`, `lastname`, `age`) VALUES (?, ?, ?, ?), (?, ?, ?, ?);');
      assert.deepEqual(query.params, [undefined, 'Jack', 'Sparrow', 34, undefined, 'Will', 'Turner', 27]);
    });

    it('accepts $query with records and optional ignore set as true', function () {
      const query = builder.compileInsertQuery({
        records: [
          {firstname: 'Jack', lastname: 'Sparrow', age: 34}
        ],
        ignore: true
      });

      assert.strictEqual(query.sql, 'INSERT IGNORE INTO `employees` (`id`, `firstname`, `lastname`, `age`) VALUES (?, ?, ?, ?);');
      assert.deepEqual(query.params, [undefined, 'Jack', 'Sparrow', 34]);
    });
  });

  describe('#compileUpsertQuery()', function () {
    it('accepts $query with records', function () {
      const query = builder.compileUpsertQuery({
        records: [
          {firstname: 'Jack', lastname: 'Sparrow', age: 34},
          {firstname: 'Will', lastname: 'Turner', age: 27}
        ]
      });

      assert.strictEqual(query.sql, 'INSERT INTO `employees` (`id`, `firstname`, `lastname`, `age`) VALUES (?, ?, ?, ?), (?, ?, ?, ?) ON DUPLICATE KEY UPDATE `id` = VALUES(`id`), `firstname` = VALUES(`firstname`), `lastname` = VALUES(`lastname`), `age` = VALUES(`age`);');
      assert.deepEqual(query.params, [undefined, 'Jack', 'Sparrow', 34, undefined, 'Will', 'Turner', 27]);
    });
  });

  describe('#compileUpdateQuery()', function () {
    it('accepts $query with records, selection, orderby and limit', function () {
      const query = builder.compileUpdateQuery({
        values: {
          age: 35
        },
        selection: [
          'SELECTION',
          ['EQ', ['KEY', 'lastname'], ['VALUE', 'Sparrow']]
        ],
        orderby: [
          'ORDERBY',
          ['ASC', ['KEY', 'firstname']],
          ['DESC', ['KEY', 'id']]
        ],
        limit: ['LIMIT', 10]
      });

      assert.strictEqual(query.sql, 'UPDATE `employees` SET `age` = ? WHERE `lastname` = ? ORDER BY `firstname` ASC, `id` DESC LIMIT 10;');
      assert.deepEqual(query.params, [35, 'Sparrow']);
    });
  });
});
