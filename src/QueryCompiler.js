import _ from 'lodash';
import CustomError from 'customerror';
import {QueryCompiler} from 'naomi';

class MySqlQueryCompiler extends QueryCompiler {

  /**
   * Escapes and returns the supplied identifier.
   * @type {string}
   * @private
   */
  escape(identifier: string): string {
    return `\`${identifier}\``;
  }

  /**
   * Compiles and returns a parameterized SQL "key" expression, based on the supplied AST.
   * @param {Array} ast abstract syntax tree, as given by the QueryParser.
   * @return {Object}
   * @private
   */
  compileKey(ast: Array): Object {
    if (ast[0] !== 'KEY') {
      throw new CustomError(`Invalid abstract syntax tree; expected "KEY", received ${ast[0]}`, 'QueryCompileException');
    }

    const sql = this.escape(ast[1]);
    const params = [];

    return {sql, params};
  }

  /**
   * Compiles and returns a parameterized SQL "value" expression, based on the supplied AST.
   * @param {Array} ast abstract syntax tree, as given by the QueryParser.
   * @return {Object}
   * @private
   */
  compileValue(ast: Array): Object {
    if (ast[0] !== 'VALUE') {
      throw new CustomError(`Invalid abstract syntax tree; expected "VALUE", received ${ast[0]}`, 'QueryCompileException');
    }

    const sql = '?';
    const params = [ast[1]];

    return {params, sql};
  }

  /**
   * Compiles and returns a parameterized SQL "values" expression, based on the supplied AST.
   * @param {Array} ast abstract syntax tree, as given by the QueryParser.
   * @return {Object}
   * @private
   */
  compileValues(ast: Array): Object {
    if (ast[0] !== 'VALUES') {
      throw new CustomError(`Invalid abstract syntax tree; expected "VALUES", received ${ast[0]}`, 'QueryCompileException');
    }

    const sql = [];
    const params = [];

    _.tail(ast).forEach((e) => {
      sql.push('?');
      params.push(e);
    });

    return {params, sql: '(' + sql.join(', ') + ')'};
  }

  /**
   * Compiles and returns a parameterized SQL "equal" expression, based on the supplied AST.
   * @param {Array} ast abstract syntax tree, as given by the QueryParser.
   * @return {Object}
   * @private
   */
  compileEqual(ast: Array): Object {
    if (ast[0] !== 'EQ') {
      throw new CustomError(`Invalid abstract syntax tree; expected "EQ", received ${ast[0]}`, 'QueryCompileException');
    }

    const key = this.compileKey(ast[1]);
    const value = this.compileValue(ast[2]);

    const sql = [key.sql];
    let params = key.params;

    if (value.params[0] === null) {
      sql.push('IS NULL');
    } else {
      sql.push('=', value.sql);
      params = params.concat(value.params);
    }

    return {params, sql: sql.join(' ')};
  }

  /**
   * Compiles and returns a parameterized SQL "not equal" expression, based on the supplied AST.
   * @param {Array} ast abstract syntax tree, as given by the QueryParser.
   * @return {Object}
   * @private
   */
  compileNotEqual(ast: Array): Object {
    if (ast[0] !== 'NE') {
      throw new CustomError(`Invalid abstract syntax tree; expected "NE", received ${ast[0]}`, 'QueryCompileException');
    }

    const key = this.compileKey(ast[1]);
    const value = this.compileValue(ast[2]);

    const sql = [key.sql];
    let params = key.params;

    if (value.params[0] === null) {
      sql.push('IS NOT NULL');
    } else {
      sql.push('!=', value.sql);
      params = params.concat(value.params);
    }

    return {params, sql: sql.join(' ')};
  }

  /**
   * Compiles and returns a parameterized SQL "greater than" expression, based on the supplied AST.
   * @param {Array} ast abstract syntax tree, as given by the QueryParser.
   * @return {Object}
   * @private
   */
  compileGreaterThan(ast: Array): Object {
    if (ast[0] !== 'GT') {
      throw new CustomError(`Invalid abstract syntax tree; expected "GT", received ${ast[0]}`, 'QueryCompileException');
    }

    const key = this.compileKey(ast[1]);
    const value = this.compileValue(ast[2]);

    const sql = [key.sql];
    let params = key.params;

    sql.push('>', value.sql);
    params = params.concat(value.params);

    return {params, sql: sql.join(' ')};
  }

  /**
   * Compiles and returns a parameterized SQL "greater than or equal" expression, based on the supplied AST.
   * @param {Array} ast abstract syntax tree, as given by the QueryParser.
   * @return {Object}
   * @private
   */
  compileGreaterThanOrEqual(ast: Array): Object {
    if (ast[0] !== 'GTE') {
      throw new CustomError(`Invalid abstract syntax tree; expected "GTE", received ${ast[0]}`, 'QueryCompileException');
    }

    const key = this.compileKey(ast[1]);
    const value = this.compileValue(ast[2]);

    const sql = [key.sql];
    let params = key.params;

    sql.push('>=', value.sql);
    params = params.concat(value.params);

    return {params, sql: sql.join(' ')};
  }

  /**
   * Compiles and returns a parameterized SQL "less than" expression, based on the supplied AST.
   * @param {Array} ast abstract syntax tree, as given by the QueryParser.
   * @return {Object}
   * @private
   */
  compileLessThan(ast: Array): Object {
    if (ast[0] !== 'LT') {
      throw new CustomError(`Invalid abstract syntax tree; expected "LT", received ${ast[0]}`, 'QueryCompileException');
    }

    const key = this.compileKey(ast[1]);
    const value = this.compileValue(ast[2]);

    const sql = [key.sql];
    let params = key.params;

    sql.push('<', value.sql);
    params = params.concat(value.params);

    return {params, sql: sql.join(' ')};
  }

  /**
   * Compiles and returns a parameterized SQL "less than or equal" expression, based on the supplied AST.
   * @param {Array} ast abstract syntax tree, as given by the QueryParser.
   * @return {Object}
   * @private
   */
  compileLessThanOrEqual(ast: Array): Object {
    if (ast[0] !== 'LTE') {
      throw new CustomError(`Invalid abstract syntax tree; expected "LTE", received ${ast[0]}`, 'QueryCompileException');
    }

    const key = this.compileKey(ast[1]);
    const value = this.compileValue(ast[2]);

    const sql = [key.sql];
    let params = key.params;

    sql.push('<=', value.sql);
    params = params.concat(value.params);

    return {params, sql: sql.join(' ')};
  }

  /**
   * Compiles and returns a parameterized SQL "in" expression, based on the supplied AST.
   * @param {Array} ast abstract syntax tree, as given by the QueryParser.
   * @return {Object}
   * @private
   */
  compileIn(ast: Array): Object {
    if (ast[0] !== 'IN') {
      throw new CustomError(`Invalid abstract syntax tree; expected "IN", received ${ast[0]}`, 'QueryCompileException');
    }

    const key = this.compileKey(ast[1]);
    const values = this.compileValues(ast[2]);

    const sql = [key.sql];
    let params = key.params;

    sql.push('IN', values.sql);
    params = params.concat(values.params);

    return {params, sql: sql.join(' ')};
  }

  /**
   * Compiles and returns a parameterized SQL "not in" expression, based on the supplied AST.
   * @param {Array} ast abstract syntax tree, as given by the QueryParser.
   * @return {Object}
   * @private
   */
  compileNotIn(ast: Array): Object {
    if (ast[0] !== 'NIN') {
      throw new CustomError(`Invalid abstract syntax tree; expected "NIN", received ${ast[0]}`, 'QueryCompileException');
    }

    const key = this.compileKey(ast[1]);
    const values = this.compileValues(ast[2]);

    const sql = [key.sql];
    let params = key.params;

    sql.push('NOT IN', values.sql);
    params = params.concat(values.params);

    return {params, sql: sql.join(' ')};
  }

  /**
   * Compiles and returns a parameterized SQL "like" expression, based on the supplied AST.
   * @param {Array} ast abstract syntax tree, as given by the QueryParser.
   * @return {Object}
   * @private
   */
  compileLike(ast: Array): Object {
    if (ast[0] !== 'LIKE') {
      throw new CustomError(`Invalid abstract syntax tree; expected "LIKE", received ${ast[0]}`, 'QueryCompileException');
    }

    const key = this.compileKey(ast[1]);
    const value = this.compileValue(ast[2]);

    const sql = [key.sql];
    let params = key.params;

    sql.push('LIKE', value.sql);
    params = params.concat(value.params);

    return {params, sql: sql.join(' ')};
  }

  /**
   * Compiles and returns a parameterized SQL "not like" expression, based on the supplied AST.
   * @param {Array} ast abstract syntax tree, as given by the QueryParser.
   * @return {Object}
   * @private
   */
  compileNotLike(ast: Array): Object {
    if (ast[0] !== 'NLIKE') {
      throw new CustomError(`Invalid abstract syntax tree; expected "NLIKE", received ${ast[0]}`, 'QueryCompileException');
    }

    const key = this.compileKey(ast[1]);
    const value = this.compileValue(ast[2]);

    const sql = [key.sql];
    let params = key.params;

    sql.push('NOT LIKE', value.sql);
    params = params.concat(value.params);

    return {params, sql: sql.join(' ')};
  }

  /**
   * Compiles and returns a parameterized SQL "and" expression, based on the supplied AST.
   * @param {Array} ast abstract syntax tree, as given by the QueryParser.
   * @return {Object}
   * @private
   */
  compileAnd(ast: Array): Object {
    if (ast[0] !== 'AND') {
      throw new CustomError(`Invalid abstract syntax tree; expected "AND", received ${ast[0]}`, 'QueryCompileException');
    }

    const sql = [];
    let params = [];

    _.tail(ast).forEach((e) => {
      const expr = this.compileSelection(['SELECTION', e]);
      sql.push('(' + expr.sql + ')');
      params = params.concat(expr.params);
    });

    return {params, sql: sql.join(' AND ')};
  }

  /**
   * Compiles and returns a parameterized SQL "or" expression, based on the supplied AST.
   * @param {Array} ast abstract syntax tree, as given by the QueryParser.
   * @return {Object}
   * @private
   */
  compileOr(ast: Array): Object {
    if (ast[0] !== 'OR') {
      throw new CustomError(`Invalid abstract syntax tree; expected "OR", received ${ast[0]}`, 'QueryCompileException');
    }

    const sql = [];
    let params = [];

    _.tail(ast).forEach((e) => {
      const expr = this.compileSelection(['SELECTION', e]);
      sql.push('(' + expr.sql + ')');
      params = params.concat(expr.params);
    });

    return {params, sql: sql.join(' OR ')};
  }

  /**
   * Compiles and returns a parameterized SQL "selection" clause, based on the supplied AST.
   * @param {Array} ast abstract syntax tree, as given by the QueryParser.
   * @return {Object}
   * @private
   */
  compileSelection(ast: Array): Object {
    if (ast[0] !== 'SELECTION') {
      throw new CustomError(`Invalid abstract syntax tree; expected "SELECTION", received ${ast[0]}`, 'QueryCompileException');
    }

    if (_.isNil(ast[1])) {
      return {sql: '', params: []};
    }

    switch (ast[1][0]) {
    case 'EQ':
      return this.compileEqual(ast[1]);
    case 'NE':
      return this.compileNotEqual(ast[1]);
    case 'GT':
      return this.compileGreaterThan(ast[1]);
    case 'GTE':
      return this.compileGreaterThanOrEqual(ast[1]);
    case 'LT':
      return this.compileLessThan(ast[1]);
    case 'LTE':
      return this.compileLessThanOrEqual(ast[1]);
    case 'IN':
      return this.compileIn(ast[1]);
    case 'NIN':
      return this.compileNotIn(ast[1]);
    case 'LIKE':
      return this.compileLike(ast[1]);
    case 'NLIKE':
      return this.compileNotLike(ast[1]);
    case 'AND':
      return this.compileAnd(ast[1]);
    case 'OR':
      return this.compileOr(ast[1]);
    default:
      throw new CustomError(`Invalid abstract syntax tree; unknown identifier: ${ast[0]}`, 'QueryCompileException');
    }
  }

  /**
   * Compiles and returns a parameterized SQL "order by" clause, based on the supplied AST.
   * @param {Array} ast abstract syntax tree, as given by the QueryParser.
   * @return {Object}
   * @private
   */
  compileOrderBy(ast: Array): Object {
    const sql = [];
    let params = [];

    if (ast[0] !== 'ORDERBY') {
      throw new CustomError(`Invalid abstract syntax tree; expected "ORDERBY", received ${ast[0]}`, 'QueryCompileException');
    }

    if (!_.isNil(ast[1])) {
      _.tail(ast).forEach((arr) => {
        if (arr[0] === 'DESC') {
          const key = this.compileKey(arr[1]);
          sql.push(`${key.sql} DESC`);
          params = params.concat(key.params);
        } else if (arr[0] === 'ASC') {
          const key = this.compileKey(arr[1]);
          sql.push(`${key.sql} ASC`);
          params = params.concat(key.params);
        } else {
          throw new CustomError(`Invalid abstract syntax tree; expected "ASC" or "DESC", received ${ast[0]}`, 'QueryCompileException');
        }
      });
    }

    return {params, sql: sql.join(', ')};
  }

  /**
   * Compiles and returns a parameterized SQL "projection" clause, based on the supplied AST.
   * @param {Array} ast abstract syntax tree, as given by the QueryParser.
   * @return {Object}
   * @private
   */
  compileProjection(ast: Array): Object {
    if (ast[0] !== 'PROJECTION') {
      throw new CustomError(`Invalid abstract syntax tree; expected "PROJECTION", received ${ast[0]}`, 'QueryCompileException');
    }

    let included = [];
    const excluded = [];

    if (!_.isNil(ast[1])) {
      _.tail(ast).forEach((e) => {
        switch (e[0]) {
        case 'INCLUDE':
          included.push(e[1]);
          break;
        case 'EXCLUDE':
          excluded.push(e[1]);
          break;
        default:
          throw new CustomError(`Invalid abstract syntax tree; expected "INCLUDE" or "EXCLUDE", received ${ast[0]}`, 'QueryCompileException');
        }
      });
    }

    if (included.length === 0) {
      included = this.schema.getColumnNames().map((e) => {
        return ['KEY', e];
      });
    }

    if (excluded.length !== 0) {
      included = _.differenceWith(included, excluded, _.isEqual);

      if (included.length === 0) {
        throw new CustomError(`Invalid abstract syntax tree; "INCLUDE" and "EXCLUDE" directives cancel each other`, 'QueryCompileException');
      }
    }

    const sql = [];
    let params = [];

    included.forEach((e) => {
      const key = this.compileKey(e);
      sql.push(key.sql);
      params = params.concat(params);
    });

    return {params, sql: sql.join(', ')};
  }

  /**
   * Compiles and returns a parameterized SQL "limit" expression, based on the supplied AST.
   * @param {Array} ast abstract syntax tree, as given by the QueryParser.
   * @return {Object}
   * @private
   */
  compileLimit(ast: Array): Object {
    if (ast[0] !== 'LIMIT') {
      throw new CustomError(`Invalid abstract syntax tree; expected "LIMIT", received ${ast[0]}`, 'QueryCompileException');
    }

    if (_.isNil(ast[1])) {
      return {sql: '', params: []};
    }

    return {sql: ast[1].toString(), params: []};
  }

  /**
   * Compiles and returns a parameterized SQL "offset" expression, based on the supplied AST.
   * @param {Array} ast abstract syntax tree, as given by the QueryParser.
   * @return {Object}
   * @private
   */
  compileOffset(ast: Array): Object {
    if (ast[0] !== 'OFFSET') {
      throw new CustomError(`Invalid abstract syntax tree; expected "OFFSET", received ${ast[0]}`, 'QueryCompileException');
    }

    if (_.isNil(ast[1])) {
      return {sql: '', params: []};
    }

    return {sql: ast[1].toString(), params: []};
  }

  /**
   * Compiles and returns a parameterized SQL "find" query.
   * @param {Object} $query a collection of ASTs, as given by the QueryParser.
   * @param {Array} $query.selection selection abstract syntax tree.
   * @param {Array} $query.projection projection abstract syntax tree.
   * @param {Array} $query.orderby order by abstract syntax tree.
   * @param {Array} $query.limit limit abstract syntax tree.
   * @param {Array} $query.offset offset abstract syntax tree.
   * @return {Object}
   */
  compileFindQuery($query: {selection: Array, projection: Array, orderby: Array, limit: Array, offset: Array}): Object {
    const sql = [];
    let params = [];

    sql.push('SELECT');

    const projection = this.compileProjection($query.projection);
    sql.push(projection.sql);
    params = params.concat(projection.params);

    sql.push('FROM', this.escape(this.name));

    const selection = this.compileSelection($query.selection);

    if (!_.isEmpty(selection.sql)) {
      sql.push('WHERE', selection.sql);
      params = params.concat(selection.params);
    }

    const orderby = this.compileOrderBy($query.orderby);

    if (!_.isEmpty(orderby.sql)) {
      sql.push('ORDER BY', orderby.sql);
      params = params.concat(orderby.params);
    }

    const limit = this.compileLimit($query.limit);

    if (!_.isEmpty(limit.sql)) {
      sql.push('LIMIT', limit.sql);
      params = params.concat(limit.params);

      const offset = this.compileOffset($query.offset);

      if (!_.isEmpty(offset.sql)) {
        sql.push('OFFSET', offset.sql);
        params = params.concat(offset.params);
      }
    }

    return {params, sql: sql.join(' ') + ';'};
  }

  /**
   * Compiles and returns a parameterized SQL "count" query.
   * @param {Object} $query a collection of ASTs, as given by the QueryParser.
   * @param {Array} $query.selection selection abstract syntax tree.
   * @param {Array} $query.orderby order by abstract syntax tree.
   * @param {Array} $query.limit limit abstract syntax tree.
   * @param {Array} $query.offset offset abstract syntax tree.
   * @return {Object}
   */
  compileCountQuery($query: {selection: Array, orderby: Array, limit: Array, offset: Array}): Object {
    const sql = [];
    let params = [];

    sql.push('SELECT COUNT(*) AS `count`');
    sql.push('FROM', this.escape(this.name));

    const selection = this.compileSelection($query.selection);

    if (!_.isEmpty(selection.sql)) {
      sql.push('WHERE', selection.sql);
      params = params.concat(selection.params);
    }

    const orderby = this.compileOrderBy($query.orderby);

    if (!_.isEmpty(orderby.sql)) {
      sql.push('ORDER BY', orderby.sql);
      params = params.concat(orderby.params);
    }

    const limit = this.compileLimit($query.limit);

    if (!_.isEmpty(limit.sql)) {
      sql.push('LIMIT', limit.sql);
      params = params.concat(limit.params);

      const offset = this.compileOffset($query.offset);

      if (!_.isEmpty(offset.sql)) {
        sql.push('OFFSET', offset.sql);
        params = params.concat(offset.params);
      }
    }

    return {params, sql: sql.join(' ') + ';'};
  }

  /**
   * Compiles and returns a parameterized SQL "remove" query.
   * @param {Object} $query a collection of ASTs, as given by the QueryParser.
   * @param {Array} $query.selection selection abstract syntax tree.
   * @param {Array} $query.orderby order by abstract syntax tree.
   * @param {Array} $query.limit limit abstract syntax tree.
   * @return {Object}
   * @throws {NotImplementedException} if method has not been implemented or does not apply to the current database engine.
   */
  compileRemoveQuery($query: {selection: Array, orderby: Array, limit: Array}): Object {
    const sql = [];
    let params = [];

    sql.push('DELETE', 'FROM', this.escape(this.name));

    const selection = this.compileSelection($query.selection);

    if (!_.isEmpty(selection.sql)) {
      sql.push('WHERE', selection.sql);
      params = params.concat(selection.params);
    }

    const orderby = this.compileOrderBy($query.orderby);

    if (!_.isEmpty(orderby.sql)) {
      sql.push('ORDER BY', orderby.sql);
      params = params.concat(orderby.params);
    }

    const limit = this.compileLimit($query.limit);

    if (!_.isEmpty(limit.sql)) {
      sql.push('LIMIT', limit.sql);
      params = params.concat(limit.params);
    }

    return {params, sql: sql.join(' ') + ';'};
  }

  /**
   * Compiles and returns a parameterized SQL "insert" query.
   * @param {Array<Object>} records an array of records.
   * @param {Object} options query options.
   * @return {Object}
   * @throws {NotImplementedException} if method has not been implemented or does not apply to the current database engine.
   */
  compileInsertQuery(records: Array<Object>, options = {}: Object): Object {
    const sql = [];
    const params = [];

    sql.push('INSERT');

    if (options.ignore === true) {
      sql.push('IGNORE');
    }

    sql.push('INTO', this.escape(this.name));

    const keys = this.schema.getColumnNames();
    const columns = keys.map((e) => this.escape(e)).join(', ');

    sql.push(`(${columns})`);

    const values = records
      .map((e) => {
        const group = keys
          .map(function (k) {
            params.push(e[k]);
            return '?';
          })
          .join(', ');

        return `(${group})`;
      })
      .join(', ');

    sql.push('VALUES', values);

    return {params, sql: sql.join(' ') + ';'};
  }

  /**
   * Compiles and returns a parameterized SQL "insert" query.
   * @param {Array<Object>} records an array of records.
   * @param {Object} options query options.
   * @return {Object}
   * @throws {NotImplementedException} if method has not been implemented or does not apply to the current database engine.
   */
  compileUpsertQuery(records: Array<Object>, options = {}: Object): Object {
    const sql = [];
    const params = [];

    sql.push('INSERT INTO', this.escape(this.name));

    const keys = this.schema.getColumnNames();
    const columns = keys.map((e) => this.escape(e)).join(', ');

    sql.push(`(${columns})`);

    const values = records
      .map((e) => {
        const group = keys
          .map(function (k) {
            params.push(e[k]);
            return '?';
          })
          .join(', ');

        return `(${group})`;
      })
      .join(', ');

    sql.push('VALUES', values);

    const updateKeys = keys;
    const updateValues = updateKeys
      .map((k) => {
        k = this.escape(k);
        return `${k} = VALUES(${k})`;
      })
      .join(', ');

    sql.push('ON DUPLICATE KEY UPDATE', updateValues);

    return {params, sql: sql.join(' ') + ';'};
  }

}

export default MySqlQueryCompiler;
