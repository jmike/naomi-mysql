/* global describe, it, before, after */

import {assert} from 'chai';
import compileInsertQuery from '../../src/compilers/insert';

describe('Insert query compiler', function () {
  it('accepts props with table, columns and records', function () {
    const query = compileInsertQuery({
      table: 'employees',
      columns: ['id', 'firstname', 'lastname', 'age'],
      records: [
        {firstname: 'Jack', lastname: 'Sparrow', age: 34},
        {firstname: 'Will', lastname: 'Turner', age: 27}
      ]
    });

    assert.strictEqual(query.sql, 'INSERT INTO `employees` (`id`, `firstname`, `lastname`, `age`) VALUES (?, ?, ?, ?), (?, ?, ?, ?);');
    assert.deepEqual(query.params, [undefined, 'Jack', 'Sparrow', 34, undefined, 'Will', 'Turner', 27]);
  });

  it('accepts props with table, columns, records records and ignore set as true', function () {
    const query = compileInsertQuery({
      table: 'employees',
      columns: ['id', 'firstname', 'lastname', 'age'],
      records: [
        {firstname: 'Jack', lastname: 'Sparrow', age: 34}
      ],
      ignore: true
    });

    assert.strictEqual(query.sql, 'INSERT IGNORE INTO `employees` (`id`, `firstname`, `lastname`, `age`) VALUES (?, ?, ?, ?);');
    assert.deepEqual(query.params, [undefined, 'Jack', 'Sparrow', 34]);
  });
});
