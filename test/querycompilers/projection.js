/* global describe, it, before, after */

import {assert} from 'chai';
import compileProjection from '../../src/querycompilers/projection';

describe('Projection compiler', function () {
  it('accepts AST with nil arguments', function () {
    const query = compileProjection(['PROJECTION', null]);

    assert.strictEqual(query.sql, '`id`, `firstname`, `lastname`, `age`');
    assert.deepEqual(query.params, []);
  });

  it('accepts AST with exclude arguments', function () {
    const query = compileProjection([
      'PROJECTION',
      ['EXCLUDE', ['KEY', 'age']],
      ['EXCLUDE', ['KEY', 'id']]
    ]);

    assert.strictEqual(query.sql, '`firstname`, `lastname`');
    assert.deepEqual(query.params, []);
  });

  it('accepts AST with include arguments', function () {
    const query = compileProjection([
      'PROJECTION',
      ['INCLUDE', ['KEY', 'firstname']],
      ['INCLUDE', ['KEY', 'lastname']]
    ]);

    assert.strictEqual(query.sql, '`firstname`, `lastname`');
    assert.deepEqual(query.params, []);
  });

  it('accepts AST with include and exclude arguments', function () {
    const query = compileProjection([
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
    const query = compileProjection([
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
      compileProjection([
        'PROJECTION',
        ['INCLUDE', ['KEY', 'age']],
        ['EXCLUDE', ['KEY', 'age']],
      ]);
    }, Error);
  });
});
