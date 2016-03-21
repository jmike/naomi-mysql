/* global describe, it, before, after */

import {assert} from 'chai';
import compileProjection from '../../src/querycompilers/projection';

describe('Projection compiler', function () {
  it('accepts AST with null arguments', function () {
    const query = compileProjection(['PROJECT', null]);

    assert.strictEqual(query.sql, '*');
    assert.deepEqual(query.params, []);
  });

  it('accepts AST with key arguments', function () {
    const query = compileProjection([
      'PROJECT',
      ['KEY', 'firstname'],
      ['KEY', 'lastname']
    ]);

    assert.strictEqual(query.sql, '`firstname`, `lastname`');
    assert.deepEqual(query.params, []);
  });

  it('throws error with NPROJECT function', function () {
    assert.throws(() => compileProjection(['NPROJECT', null]), TypeError);
  });
});
