/* eslint-env node, mocha */

import { assert } from 'chai';
import compileProjection from '../../src/querycompilers/projection';

describe('Projection compiler', () => {
  it('accepts AST with null arguments', () => {
    const query = compileProjection(['PROJECTION', null]);

    assert.strictEqual(query.sql, '*');
    assert.deepEqual(query.params, []);
  });

  it('accepts AST with key arguments', () => {
    const query = compileProjection([
      'PROJECTION',
      ['KEY', 'firstname'],
      ['KEY', 'lastname']
    ]);

    assert.strictEqual(query.sql, '`firstname`, `lastname`');
    assert.deepEqual(query.params, []);
  });

  it('throws error with NPROJECT function', () => {
    assert.throws(() => compileProjection(['NPROJECT', null]), TypeError);
  });
});
