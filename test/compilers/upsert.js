/* global describe, it, before, after */

import {assert} from 'chai';
import compileUpsertQuery from '../../src/compilers/upsert';

describe('Upsert query compiler', function () {
  it('accepts props with table, columns and records', function () {
    const query = compileUpsertQuery({
      table: 'employees',
      columns: ['id', 'firstname', 'lastname', 'age'],
      records: [
        {firstname: 'Jack', lastname: 'Sparrow', age: 34},
        {firstname: 'Will', lastname: 'Turner', age: 27}
      ]
    });

    assert.strictEqual(query.sql, 'INSERT INTO `employees` (`id`, `firstname`, `lastname`, `age`) VALUES (?, ?, ?, ?), (?, ?, ?, ?) ON DUPLICATE KEY UPDATE `id` = VALUES(`id`), `firstname` = VALUES(`firstname`), `lastname` = VALUES(`lastname`), `age` = VALUES(`age`);');
    assert.deepEqual(query.params, [undefined, 'Jack', 'Sparrow', 34, undefined, 'Will', 'Turner', 27]);
  });
});
