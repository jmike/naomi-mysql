/* global describe, it, before, after */

import {assert} from 'chai';
import QueryCompiler from '../src/QueryCompiler';

describe('QueryCompiler', function () {
  const builder = new QueryCompiler('employees');

  describe('#compileKey()', function () {
    it('compiles AST', function () {
      const query = builder.compileKey(['KEY', 'a']);

      assert.strictEqual(query.sql, '`a`');
      assert.lengthOf(query.params, 0);
    });
  });

  describe('#compileOrderBy()', function () {
    it('compiles AST', function () {
      const query = builder.compileOrderBy([
        'ORDERBY',
        ['ASC', ['KEY', 'foo']],
        ['DESC', ['KEY', 'bar']]
      ]);

      assert.strictEqual(query.sql, 'ORDER BY `foo` ASC, `bar` DESC');
      assert.lengthOf(query.params, 0);
    });
  });

  // describe('#buildFind()', function () {
  //   const db = new Database({
  //     host: process.env.MYSQL_HOST,
  //     port: parseInt(process.env.MYSQL_PORT, 10),
  //     user: process.env.MYSQL_USER,
  //     password: process.env.MYSQL_PASSWORD,
  //     database: process.env.MYSQL_DATABASE
  //   });
  //   const employees = db.createCollection('employees');
  //   const builder = new QueryCompiler(employees);

  //   it('accepts empty AST', function () {
  //     const query = builder.buildFind([]);

  //     assert.strictEqual(query.sql, 'SELECT * FROM `employees`;');
  //     assert.lengthOf(query.params, 0);
  //   });

  //   it('accepts EQ operators in the AST', function () {
  //     const query = builder.buildFind([
  //       'EQ',
  //       ['KEY', 'a'],
  //       ['VALUE', 1]
  //     ]);

  //     assert.strictEqual(query.sql, 'SELECT * FROM `employees` WHERE `a` = ?;');
  //     assert.sameMembers(query.params, [1]);
  //   });
  // });
});
