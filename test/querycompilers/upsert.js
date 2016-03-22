/* global describe, it, before, after */

import {assert} from 'chai';
import compileUpsertQuery from '../../src/querycompilers/upsert';

describe('Upsert query compiler', function () {
  it('accepts props with table, columns and records', function () {
    const query = compileUpsertQuery({
      collection: [
        'COLLECTION',
        ['KEY', 'employees']
      ],
      keys: ['id', 'firstname', 'lastname', 'age'],
      updateKeys: ['firstname', 'lastname', 'age'],
      values: [
        {firstname: 'Jack', lastname: 'Sparrow', age: 34},
        {firstname: 'Will', lastname: 'Turner', age: 27}
      ]
    });

    assert.strictEqual(query.sql, 'INSERT INTO `employees` (`id`, `firstname`, `lastname`, `age`) VALUES (?, ?, ?, ?), (?, ?, ?, ?) ON DUPLICATE KEY UPDATE `firstname` = VALUES(`firstname`), `lastname` = VALUES(`lastname`), `age` = VALUES(`age`);');
    assert.deepEqual(query.params, [undefined, 'Jack', 'Sparrow', 34, undefined, 'Will', 'Turner', 27]);
  });
});
