/* global describe, it, before, after */

import {assert} from 'chai';
import Database from '../src/Database';
import naomi from '../src/naomi';

describe('naomi', function () {
  it('creates a mysql database', function () {
    assert.instanceOf(naomi.database('mysql', {database: 'foobar'}), Database);
  });
});
