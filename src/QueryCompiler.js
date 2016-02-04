import _ from 'lodash';
import CustomError from 'customerror';
import {QueryCompiler} from 'naomi';

class MySqlQueryCompiler extends QueryCompiler {

  /**
   * Builds and returns a key based on the supplied AST.
   * @param {Array} ast abstract syntax tree.
   * @return {Object}
   */
  compileKey(ast: Array) {
    const sql = [];
    const params = [];

    if (ast[0] !== 'KEY') {
      throw new CustomError('Invalid key AST', 'QueryCompileException');
    }

    sql.push(`\`${ast[1]}\``);

    return {params, sql: sql.join('')};
  }

  /**
   * Builds and returns an orderby clause, based on the supplied AST.
   * @param {Array} ast abstract syntax tree.
   * @return {Object}
   */
  compileOrderBy(ast: Array) {
    let sql = [];
    let params = [];

    switch (ast[0]) {
    case 'ORDERBY':
      sql.push('ORDER BY');
      _.tail(ast).forEach((e) => {
        const clause = this.compileOrderBy(e);
        sql = sql.concat(clause.sql);
        params = params.concat(clause.params);
      });
      break;
    case 'DESC':
      (() => {
        const clause = this.compileKey(ast[1]);
        sql = sql.concat(clause.sql);
        params = params.concat(clause.params);
      })();
      sql.push('DESC');
      break;
    case 'ASC':
      (() => {
        const clause = this.compileKey(ast[1]);
        sql = sql.concat(clause.sql);
        params = params.concat(clause.params);
      })();
      sql.push('ASC');
      break;
    default:
      throw new CustomError('Invalid orderby AST', 'QueryCompileException');
    }

    return {params, sql: sql.join('')};
  }

  // _compile(ast: Array): Object {
  //   let sql = [];
  //   let params = [];

  //   if (ast.length !== 0) {
  //     switch (ast[0]) {
  //     case 'KEY':
  //       sql.push(this.escape(ast[1]));
  //       break;

  //     case 'VALUE':
  //       sql.push('?');
  //       params.push(ast[1]);
  //       break;

  //     case 'EQ': () => {
  //       const a = this._compile(ast[1]);
  //       const b = this._compile(ast[2]);

  //       sql = sql.concat(a.sql);
  //       sql.push('=');
  //       sql = sql.concat(b.sql);

  //       params = params.concat(a.params);
  //       params = params.concat(b.params);
  //     }();
  //     break;

  //     case 'NE':
  //       const a = this._compile(ast[1]);
  //       const b = this._compile(ast[2]);

  //       sql = sql.concat(a.sql);
  //       sql.push('!=');
  //       sql = sql.concat(b.sql);

  //       params = params.concat(a.params);
  //       params = params.concat(b.params);
  //       break;

  //     default:
  //       throw new Error('Unknown operator');
  //     }
  //   }

  //   return {params, sql: sql.join(' ')};
  // }

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
