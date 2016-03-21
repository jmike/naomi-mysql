/* global describe, it, before, after */

import {assert} from 'chai';
import compileRemoveQuery from '../../src/querycompilers/remove';

describe('Remove query compiler', function () {
  it('accepts props with table, selection, orderby and limit', function () {
    const query = compileRemoveQuery({
      table: 'employees',
      selection: [
        'SELECT',
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
