/* eslint-env node, mocha */

import { assert } from 'chai';
import compileKey from '../../src/querycompilers/key';

describe('Key compiler', () => {
  it('accepts valid AST', () => {
    const query = compileKey(['KEY', 'id']);

    assert.strictEqual(query.sql, '`id`');
    assert.lengthOf(query.params, 0);
  });
});
