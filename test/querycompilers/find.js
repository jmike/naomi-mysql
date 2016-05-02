/* eslint-env node, mocha */

import { assert } from 'chai';
import compileFindQuery from '../../src/querycompilers/find';

describe('Find query compiler', () => {
  it('accepts props with table + empty projection, selection, orderby, limit and offset', () => {
    const query = compileFindQuery({
      collection: [
        'COLLECTION',
        ['KEY', 'employees']
      ],
      projection: ['PROJECTION', null],
      selection: ['SELECTION', null],
      orderby: ['ORDERBY', null],
      limit: ['LIMIT', null],
      offset: ['OFFSET', null]
    });

    assert.strictEqual(query.sql, 'SELECT * FROM `employees`;');
    assert.deepEqual(query.params, []);
  });

  it('accepts props with table, projection, selection, orderby, limit and offset', () => {
    const query = compileFindQuery({
      collection: [
        'COLLECTION',
        ['KEY', 'employees']
      ],
      projection: [
        'PROJECTION',
        ['KEY', 'firstname'],
        ['KEY', 'lastname']
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

    assert.strictEqual(query.sql, 'SELECT `firstname`, `lastname` FROM `employees` ' +
      'WHERE `age` = ? ORDER BY `firstname` ASC, `id` DESC LIMIT 10 OFFSET 20;');
    assert.deepEqual(query.params, [23]);
  });
});
