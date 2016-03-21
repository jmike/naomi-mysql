/* global describe, it, before, after */

import {assert} from 'chai';
import compileFindQuery from '../../src/querycompilers/find';

describe('Find query compiler', function () {
  it('accepts props with table + empty projection, selection, orderby, limit and offset', function () {
    const query = compileFindQuery({
      table: 'employees',
      projection: ['PROJECT', null],
      selection: ['SELECT', null],
      orderby: ['ORDERBY', null],
      limit: ['LIMIT', null],
      offset: ['OFFSET', null]
    });

    assert.strictEqual(query.sql, 'SELECT * FROM `employees`;');
    assert.deepEqual(query.params, []);
  });

  it('accepts props with table, projection, selection, orderby, limit and offset', function () {
    const query = compileFindQuery({
      table: 'employees',
      projection: [
        'PROJECT',
        ['KEY', 'firstname'],
        ['KEY', 'lastname']
      ],
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

    assert.strictEqual(query.sql, 'SELECT `firstname`, `lastname` FROM `employees` WHERE `age` = ? ORDER BY `firstname` ASC, `id` DESC LIMIT 10 OFFSET 20;');
    assert.deepEqual(query.params, [23]);
  });
});
