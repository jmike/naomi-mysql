/* global describe, it, before, after */

import {assert} from 'chai';
import compileKey from '../../src/querycompilers/key';

describe('Key compiler', function () {
  it('accepts valid AST', function () {
    const query = compileKey(['KEY', 'id']);

    assert.strictEqual(query.sql, '`id`');
    assert.lengthOf(query.params, 0);
  });
});
