/* global describe, it */

import {assert} from 'chai';
import Promise from 'bluebird';
import Database from '../src/Database';

describe('Database', function () {
  describe('#constructor()', function () {
    it('throws error when database property is absent', function () {
      assert.throws(() => new Database({}), TypeError);
      assert.doesNotThrow(() => new Database({database: 'str'}), TypeError);
    });

    it('throws error when database property is invalid', function () {
      assert.throws(() => new Database({database: 123}), TypeError);
      assert.throws(() => new Database({database: true}), TypeError);
      assert.throws(() => new Database({database: {}}), TypeError);
    });

    it('throws error when host property is invalid', function () {
      assert.throws(() => new Database({database: 'str', host: 123}), TypeError);
      assert.throws(() => new Database({database: 'str', host: true}), TypeError);
      assert.throws(() => new Database({database: 'str', host: {}}), TypeError);
    });

    it('throws error when port property is invalid', function () {
      assert.throws(() => new Database({database: 'str', port: 'str'}), TypeError);
      assert.throws(() => new Database({database: 'str', port: true}), TypeError);
      assert.throws(() => new Database({database: 'str', port: {}}), TypeError);
    });

    it('throws error when user property is invalid', function () {
      assert.throws(() => new Database({database: 'str', user: 123}), TypeError);
      assert.throws(() => new Database({database: 'str', user: true}), TypeError);
      assert.throws(() => new Database({database: 'str', user: {}}), TypeError);
    });

    it('throws error when password property is invalid', function () {
      assert.throws(() => new Database({database: 'str', password: 123}), TypeError);
      assert.throws(() => new Database({database: 'str', password: true}), TypeError);
      assert.throws(() => new Database({database: 'str', password: {}}), TypeError);
    });
  });
});
