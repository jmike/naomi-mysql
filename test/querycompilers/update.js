/* eslint-env node, mocha */

import { assert } from 'chai';
import compileUpdateQuery from '../../src/querycompilers/update';

describe('Update query compiler', () => {
  it('accepts props with table, records, selection, orderby and limit', () => {
    const query = compileUpdateQuery({
      collection: [
        'COLLECTION',
        ['KEY', 'employees']
      ],
      attrs: {
        age: 35
      },
      selection: [
        'SELECTION',
        ['EQ', ['KEY', 'lastname'], ['VALUE', 'Sparrow']]
      ],
      orderby: [
        'ORDERBY',
        ['ASC', ['KEY', 'firstname']],
        ['DESC', ['KEY', 'id']]
      ],
      limit: ['LIMIT', 10]
    });

    assert.strictEqual(query.sql, 'UPDATE `employees` SET `age` = ? ' +
      'WHERE `lastname` = ? ORDER BY `firstname` ASC, `id` DESC LIMIT 10;');
    assert.deepEqual(query.params, [35, 'Sparrow']);
  });
});
