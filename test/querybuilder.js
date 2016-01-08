/* global describe, it, before, after */

import {assert} from 'chai';
import Promise from 'bluebird';
import QueryBuilder from '../src/QueryBuilder';

describe('QueryBuilder', function () {
  describe('#buildFind()', function () {
    const builder = new QueryBuilder('employees');

    it('accepts empty AST', function () {
      const query = builder.buildFind([]);

      assert.strictEqual(query.sql, 'SELECT * FROM `employees`;');
      assert.lengthOf(query.params, 0);
    });

    it('accepts EQ operators in the AST', function () {
      const query = builder.buildFind([
        'EQ',
        ['KEY', 'a'],
        ['VALUE', 1]
      ]);

      assert.strictEqual(query.sql, 'SELECT * FROM `employees` WHERE `a` = ?;');
      assert.sameMembers(query.params, [1]);
    });
  });
});
