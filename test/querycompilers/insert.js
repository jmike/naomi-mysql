/* global describe, it, before, after */

import {assert} from 'chai';
import compileInsertQuery from '../../src/querycompilers/insert';

describe('Insert query compiler', function () {
  it('accepts props with table, keys and values', function () {
    const query = compileInsertQuery({
      collection: [
        'COLLECTION',
        ['KEY', 'employees']
      ],
      keys: ['id', 'firstname', 'lastname', 'age'],
      values: [
        {firstname: 'Jack', lastname: 'Sparrow', age: 34},
        {firstname: 'Will', lastname: 'Turner', age: 27}
      ]
    });

    assert.strictEqual(query.sql, 'INSERT INTO `employees` (`id`, `firstname`, `lastname`, `age`) VALUES (?, ?, ?, ?), (?, ?, ?, ?);');
    assert.deepEqual(query.params, [undefined, 'Jack', 'Sparrow', 34, undefined, 'Will', 'Turner', 27]);
  });

  it('accepts props with table, keys, values + ignore = true', function () {
    const query = compileInsertQuery({
      collection: [
        'COLLECTION',
        ['KEY', 'employees']
      ],
      keys: ['id', 'firstname', 'lastname', 'age'],
      values: [
        {firstname: 'Jack', lastname: 'Sparrow', age: 34}
      ],
      ignore: true
    });

    assert.strictEqual(query.sql, 'INSERT IGNORE INTO `employees` (`id`, `firstname`, `lastname`, `age`) VALUES (?, ?, ?, ?);');
    assert.deepEqual(query.params, [undefined, 'Jack', 'Sparrow', 34]);
  });
});
