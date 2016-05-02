/* eslint-env node, mocha */

import { assert } from 'chai';
import compileSelection from '../../src/querycompilers/selection';

describe('Selection compiler', () => {
  it('accepts AST with nil arguments', () => {
    const query = compileSelection(['SELECTION', null]);

    assert.strictEqual(query.sql, '');
    assert.deepEqual(query.params, []);
  });

  it('accepts AST with nested EQ function', () => {
    const query = compileSelection([
      'SELECTION',
      ['EQ', ['KEY', 'age'], ['VALUE', 23]]
    ]);

    assert.strictEqual(query.sql, '`age` = ?');
    assert.deepEqual(query.params, [23]);
  });

  it('accepts AST with nested EQ function + null argument', () => {
    const query = compileSelection([
      'SELECTION',
      ['EQ', ['KEY', 'age'], ['VALUE', null]]
    ]);

    assert.strictEqual(query.sql, '`age` IS NULL');
    assert.deepEqual(query.params, []);
  });

  it('accepts AST with nested NE function', () => {
    const query = compileSelection([
      'SELECTION',
      ['NE', ['KEY', 'age'], ['VALUE', 23]]
    ]);

    assert.strictEqual(query.sql, '`age` != ?');
    assert.deepEqual(query.params, [23]);
  });

  it('accepts AST with nested NE function + null value', () => {
    const query = compileSelection([
      'SELECTION',
      ['NE', ['KEY', 'age'], ['VALUE', null]]
    ]);

    assert.strictEqual(query.sql, '`age` IS NOT NULL');
    assert.deepEqual(query.params, []);
  });

  it('accepts AST with nested GT function', () => {
    const query = compileSelection([
      'SELECTION',
      ['GT', ['KEY', 'age'], ['VALUE', 23]]
    ]);

    assert.strictEqual(query.sql, '`age` > ?');
    assert.deepEqual(query.params, [23]);
  });

  it('accepts AST with nested GTE function', () => {
    const query = compileSelection([
      'SELECTION',
      ['GTE', ['KEY', 'age'], ['VALUE', 23]]
    ]);

    assert.strictEqual(query.sql, '`age` >= ?');
    assert.deepEqual(query.params, [23]);
  });

  it('accepts AST with nested LT function', () => {
    const query = compileSelection([
      'SELECTION',
      ['LT', ['KEY', 'age'], ['VALUE', 23]]
    ]);

    assert.strictEqual(query.sql, '`age` < ?');
    assert.deepEqual(query.params, [23]);
  });

  it('accepts AST with nested LTE function', () => {
    const query = compileSelection([
      'SELECTION',
      ['LTE', ['KEY', 'age'], ['VALUE', 23]]
    ]);

    assert.strictEqual(query.sql, '`age` <= ?');
    assert.deepEqual(query.params, [23]);
  });

  it('accepts AST with nested IN function', () => {
    const query = compileSelection([
      'SELECTION',
      ['IN', ['KEY', 'age'], ['VALUES', 20, 30, 40]]
    ]);

    assert.strictEqual(query.sql, '`age` IN (?, ?, ?)');
    assert.deepEqual(query.params, [20, 30, 40]);
  });

  it('accepts AST with nested NIN function', () => {
    const query = compileSelection([
      'SELECTION',
      ['NIN', ['KEY', 'age'], ['VALUES', 20, 30, 40]]
    ]);

    assert.strictEqual(query.sql, '`age` NOT IN (?, ?, ?)');
    assert.deepEqual(query.params, [20, 30, 40]);
  });

  it('accepts AST with nested LIKE function', () => {
    const query = compileSelection([
      'SELECTION',
      ['LIKE', ['KEY', 'firstname'], ['VALUE', '%ohn']]
    ]);

    assert.strictEqual(query.sql, '`firstname` LIKE ?');
    assert.deepEqual(query.params, ['%ohn']);
  });

  it('accepts AST with nested NLIKE function', () => {
    const query = compileSelection([
      'SELECTION',
      ['NLIKE', ['KEY', 'firstname'], ['VALUE', '%ohn']]
    ]);

    assert.strictEqual(query.sql, '`firstname` NOT LIKE ?');
    assert.deepEqual(query.params, ['%ohn']);
  });

  it('accepts AST with nested AND function', () => {
    const query = compileSelection([
      'SELECTION',
      ['AND',
        ['EQ', ['KEY', 'age'], ['VALUE', 23]],
        ['NE', ['KEY', 'firstname'], ['VALUE', 'John']]
      ]
    ]);

    assert.strictEqual(query.sql, '(`age` = ?) AND (`firstname` != ?)');
    assert.deepEqual(query.params, [23, 'John']);
  });

  it('accepts AST with nested OR function', () => {
    const query = compileSelection([
      'SELECTION',
      ['OR',
        ['EQ', ['KEY', 'age'], ['VALUE', 23]],
        ['NE', ['KEY', 'firstname'], ['VALUE', 'John']]
      ]
    ]);

    assert.strictEqual(query.sql, '(`age` = ?) OR (`firstname` != ?)');
    assert.deepEqual(query.params, [23, 'John']);
  });

  it('accepts AST with nested AND function + inner nested OR function', () => {
    const query = compileSelection([
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
