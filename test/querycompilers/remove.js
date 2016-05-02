/* eslint-env node, mocha */

import { assert } from 'chai';
import compileRemoveQuery from '../../src/querycompilers/remove';

describe('Remove query compiler', () => {
  it('accepts props with table, selection, orderby and limit', () => {
    const query = compileRemoveQuery({
      collection: [
        'COLLECTION',
        ['KEY', 'employees']
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
      limit: ['LIMIT', 10]
    });

    assert.strictEqual(query.sql, 'DELETE FROM `employees` WHERE `age` = ? ORDER BY `firstname` ASC, `id` DESC LIMIT 10;');
    assert.deepEqual(query.params, [23]);
  });
});
