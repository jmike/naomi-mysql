/* global describe, it, before, after */

import {assert} from 'chai';
import compileOrderBy from '../../src/querycompilers/orderBy';

describe('OrderBy compiler', function () {
  it('accepts valid AST', function () {
    const query = compileOrderBy([
      'ORDERBY',
      ['ASC', ['KEY', 'name']],
      ['DESC', ['KEY', 'age']]
    ]);

    assert.strictEqual(query.sql, '`name` ASC, `age` DESC');
    assert.lengthOf(query.params, 0);
  });
});
