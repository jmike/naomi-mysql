/* global describe, it, before, after */

import {assert} from 'chai';
import compileSelection from '../../src/querycompilers/selection';

describe('Selection compiler', function () {
  it('accepts AST with nil arguments', function () {
    const query = compileSelection(['SELECT', null]);

    assert.strictEqual(query.sql, '');
    assert.deepEqual(query.params, []);
  });

  it('accepts AST with nested EQ function', function () {
    const query = compileSelection([
      'SELECT',
      ['EQ', ['KEY', 'age'], ['VALUE', 23]]
    ]);

    assert.strictEqual(query.sql, '`age` = ?');
    assert.deepEqual(query.params, [23]);
  });

  it('accepts AST with nested EQ function + null argument', function () {
    const query = compileSelection([
      'SELECT',
      ['EQ', ['KEY', 'age'], ['VALUE', null]]
    ]);

    assert.strictEqual(query.sql, '`age` IS NULL');
    assert.deepEqual(query.params, []);
  });

  it('accepts AST with nested NE function', function () {
    const query = compileSelection([
      'SELECT',
      ['NE', ['KEY', 'age'], ['VALUE', 23]]
    ]);

    assert.strictEqual(query.sql, '`age` != ?');
    assert.deepEqual(query.params, [23]);
  });

  it('accepts AST with nested NE function + null value', function () {
    const query = compileSelection([
      'SELECT',
      ['NE', ['KEY', 'age'], ['VALUE', null]]
    ]);

    assert.strictEqual(query.sql, '`age` IS NOT NULL');
    assert.deepEqual(query.params, []);
  });

  it('accepts AST with nested GT function', function () {
    const query = compileSelection([
      'SELECT',
      ['GT', ['KEY', 'age'], ['VALUE', 23]]
    ]);

    assert.strictEqual(query.sql, '`age` > ?');
    assert.deepEqual(query.params, [23]);
  });

  it('accepts AST with nested GTE function', function () {
    const query = compileSelection([
      'SELECT',
      ['GTE', ['KEY', 'age'], ['VALUE', 23]]
    ]);

    assert.strictEqual(query.sql, '`age` >= ?');
    assert.deepEqual(query.params, [23]);
  });

  it('accepts AST with nested LT function', function () {
    const query = compileSelection([
      'SELECT',
      ['LT', ['KEY', 'age'], ['VALUE', 23]]
    ]);

    assert.strictEqual(query.sql, '`age` < ?');
    assert.deepEqual(query.params, [23]);
  });

  it('accepts AST with nested LTE function', function () {
    const query = compileSelection([
      'SELECT',
      ['LTE', ['KEY', 'age'], ['VALUE', 23]]
    ]);

    assert.strictEqual(query.sql, '`age` <= ?');
    assert.deepEqual(query.params, [23]);
  });

  it('accepts AST with nested IN function', function () {
    const query = compileSelection([
      'SELECT',
      ['IN', ['KEY', 'age'], ['VALUES', 20, 30, 40]]
    ]);

    assert.strictEqual(query.sql, '`age` IN (?, ?, ?)');
    assert.deepEqual(query.params, [20, 30, 40]);
  });

  it('accepts AST with nested NIN function', function () {
    const query = compileSelection([
      'SELECT',
      ['NIN', ['KEY', 'age'], ['VALUES', 20, 30, 40]]
    ]);

    assert.strictEqual(query.sql, '`age` NOT IN (?, ?, ?)');
    assert.deepEqual(query.params, [20, 30, 40]);
  });

  it('accepts AST with nested LIKE function', function () {
    const query = compileSelection([
      'SELECT',
      ['LIKE', ['KEY', 'firstname'], ['VALUE', '%ohn']]
    ]);

    assert.strictEqual(query.sql, '`firstname` LIKE ?');
    assert.deepEqual(query.params, ['%ohn']);
  });

  it('accepts AST with nested NLIKE function', function () {
    const query = compileSelection([
      'SELECT',
      ['NLIKE', ['KEY', 'firstname'], ['VALUE', '%ohn']]
    ]);

    assert.strictEqual(query.sql, '`firstname` NOT LIKE ?');
    assert.deepEqual(query.params, ['%ohn']);
  });

  it('accepts AST with nested AND function', function () {
    const query = compileSelection([
      'SELECT',
      ['AND',
        ['EQ', ['KEY', 'age'], ['VALUE', 23]],
        ['NE', ['KEY', 'firstname'], ['VALUE', 'John']]
      ]
    ]);

    assert.strictEqual(query.sql, '(`age` = ?) AND (`firstname` != ?)');
    assert.deepEqual(query.params, [23, 'John']);
  });

  it('accepts AST with nested OR function', function () {
    const query = compileSelection([
      'SELECT',
      ['OR',
        ['EQ', ['KEY', 'age'], ['VALUE', 23]],
        ['NE', ['KEY', 'firstname'], ['VALUE', 'John']]
      ]
    ]);

    assert.strictEqual(query.sql, '(`age` = ?) OR (`firstname` != ?)');
    assert.deepEqual(query.params, [23, 'John']);
  });

  it('accepts AST with nested AND function + inner nested OR function', function () {
    const query = compileSelection([
      'SELECT',
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
