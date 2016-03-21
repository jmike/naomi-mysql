/* global describe, it, before, after */

import {assert} from 'chai';
import compileCountQuery from '../../src/querycompilers/count';

describe('Count query compiler', function () {
  it('accepts props with table, selection, orderby, limit and offset', function () {
    const query = compileCountQuery({
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
      limit: ['LIMIT', 10],
      offset: ['OFFSET', 20]
    });

    assert.strictEqual(query.sql, 'SELECT COUNT(*) AS `count` FROM `employees` WHERE `age` = ? ORDER BY `firstname` ASC, `id` DESC LIMIT 10 OFFSET 20;');
    assert.deepEqual(query.params, [23]);
  });
});
