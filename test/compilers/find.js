/* global describe, it, before, after */

import {assert} from 'chai';
import compileFindQuery from '../../src/compilers/find';

describe('Find query compiler', function () {
  it('accepts props with table + empty projection, selection, orderby, limit and offset', function () {
    const query = compileFindQuery({
      table: 'employees',
      projection: ['PROJECTION', null],
      selection: ['SELECTION', null],
      orderby: ['ORDERBY', null],
      limit: ['LIMIT', null],
      offset: ['OFFSET', null]
    });

    assert.strictEqual(query.sql, 'SELECT `id`, `firstname`, `lastname`, `age` FROM `employees`;');
    assert.deepEqual(query.params, []);
  });

  it('accepts props with table, projection, selection, orderby, limit and offset', function () {
    const query = compileFindQuery({
      table: 'employees',
      projection: [
        'PROJECTION',
        ['INCLUDE', ['KEY', 'firstname']],
        ['INCLUDE', ['KEY', 'lastname']]
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
      limit: ['LIMIT', 10],
      offset: ['OFFSET', 20]
    });

    assert.strictEqual(query.sql, 'SELECT `firstname`, `lastname` FROM `employees` WHERE `age` = ? ORDER BY `firstname` ASC, `id` DESC LIMIT 10 OFFSET 20;');
    assert.deepEqual(query.params, [23]);
  });
});
