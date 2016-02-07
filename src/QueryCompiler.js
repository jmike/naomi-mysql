import _ from 'lodash';
import CustomError from 'customerror';
import {QueryCompiler} from 'naomi';

class MySqlQueryCompiler extends QueryCompiler {

  /**
   * Compiles and returns a parameterized SQL KEY expression, based on the supplied AST.
   * @param {Array} ast abstract syntax tree.
   * @return {Object}
   */
  compileKey(ast: Array): Object {
    if (ast[0] !== 'KEY') {
      throw new CustomError(`Invalid abstract syntax tree; expected "KEY", received ${ast[0]}`, 'QueryCompileException');
    }

    const sql = `\`${ast[1]}\``;
    const params = [];

    return {sql, params};
  }

  /**
   * Compiles and returns a parameterized SQL VALUE expression, based on the supplied AST.
   * @param {Array} ast abstract syntax tree.
   * @return {Object}
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
   * Compiles and returns a parameterized SQL VALUE expression, based on the supplied AST.
   * @param {Array} ast abstract syntax tree.
   * @return {Object}
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
   * Compiles and returns a parameterized SQL EQ expression, based on the supplied AST.
   * @param {Array} ast abstract syntax tree.
   * @return {Object}
   */
  compileEq(ast: Array): Object {
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
   * Compiles and returns a parameterized SQL EQ expression, based on the supplied AST.
   * @param {Array} ast abstract syntax tree.
   * @return {Object}
   */
  compileNe(ast: Array): Object {
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
   * Compiles and returns a parameterized SQL GT expression, based on the supplied AST.
   * @param {Array} ast abstract syntax tree.
   * @return {Object}
   */
  compileGt(ast: Array): Object {
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
   * Compiles and returns a parameterized SQL GTE expression, based on the supplied AST.
   * @param {Array} ast abstract syntax tree.
   * @return {Object}
   */
  compileGte(ast: Array): Object {
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
   * Compiles and returns a parameterized SQL LT expression, based on the supplied AST.
   * @param {Array} ast abstract syntax tree.
   * @return {Object}
   */
  compileLt(ast: Array): Object {
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
   * Compiles and returns a parameterized SQL LTE expression, based on the supplied AST.
   * @param {Array} ast abstract syntax tree.
   * @return {Object}
   */
  compileLte(ast: Array): Object {
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
   * Compiles and returns a parameterized SQL IN expression, based on the supplied AST.
   * @param {Array} ast abstract syntax tree.
   * @return {Object}
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
   * Compiles and returns a parameterized SQL NIN expression, based on the supplied AST.
   * @param {Array} ast abstract syntax tree.
   * @return {Object}
   */
  compileNin(ast: Array): Object {
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
   * Compiles and returns a parameterized SQL LIKE expression, based on the supplied AST.
   * @param {Array} ast abstract syntax tree.
   * @return {Object}
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
   * Compiles and returns a parameterized SQL NLIKE expression, based on the supplied AST.
   * @param {Array} ast abstract syntax tree.
   * @return {Object}
   */
  compileNlike(ast: Array): Object {
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
   * Compiles and returns a parameterized SQL AND expression, based on the supplied AST.
   * @param {Array} ast abstract syntax tree.
   * @return {Object}
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
   * Compiles and returns a parameterized SQL OR expression, based on the supplied AST.
   * @param {Array} ast abstract syntax tree.
   * @return {Object}
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
   * Compiles and returns a parameterized SQL SELECTION clause, based on the supplied AST.
   * @param {Array} ast abstract syntax tree.
   * @return {Object}
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
      return this.compileEq(ast[1]);
    case 'NE':
      return this.compileNe(ast[1]);
    case 'GT':
      return this.compileGt(ast[1]);
    case 'GTE':
      return this.compileGte(ast[1]);
    case 'LT':
      return this.compileLt(ast[1]);
    case 'LTE':
      return this.compileLte(ast[1]);
    case 'IN':
      return this.compileIn(ast[1]);
    case 'NIN':
      return this.compileNin(ast[1]);
    case 'LIKE':
      return this.compileLike(ast[1]);
    case 'NLIKE':
      return this.compileNlike(ast[1]);
    case 'AND':
      return this.compileAnd(ast[1]);
    case 'OR':
      return this.compileOr(ast[1]);
    default:
      throw new CustomError(`Invalid abstract syntax tree; unknown identifier: ${ast[0]}`, 'QueryCompileException');
    }
  }

  /**
   * Builds and returns an orderby clause, based on the supplied AST.
   * @param {Array} ast abstract syntax tree.
   * @return {Object}
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
   * Compiles and returns a parameterized SQL PROJECTION clause, based on the supplied AST.
   * @param {Array} ast abstract syntax tree.
   * @return {Object}
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
      included = this.properties.map((e) => {
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

  buildFind(ast: Array): Object {
    const sql = [];
    let params = [];

    sql.push('SELECT *');
    sql.push('FROM', this.escape(this.collection.name));

    const filter = this._compile(ast);

    if (filter.sql) {
      sql.push('WHERE', filter.sql);
      params = params.concat(filter.params);
    }

    return {params, sql: `${sql.join(' ')};`};
  }

}

export default MySqlQueryCompiler;
