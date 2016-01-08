import {QueryBuilder} from 'naomi';

class MySqlQueryBuilder extends QueryBuilder {

  escape(identifier: string): string {
    return `\`${identifier}\``;
  }

  _compile(ast: Array): Object {
    let sql = [];
    let params = [];

    if (ast.length !== 0) {
      switch (ast[0]) {
      case 'KEY':
        sql.push(this.escape(ast[1]));

        break;
      case 'VALUE':
        sql.push('?');
        params.push(ast[1]);

        break;
      case 'EQ':
        const a = this._compile(ast[1]);
        const b = this._compile(ast[2]);

        sql = sql.concat(a.sql);
        sql.push('=');
        sql = sql.concat(b.sql);

        params = params.concat(a.params);
        params = params.concat(b.params);

        break;
      default:
        throw new Error('Unknown operator');
      }
    }

    return {params, sql: sql.join(' ')};
  }

  buildFind(ast: Array): Object {
    const sql = [];
    let params = [];

    sql.push('SELECT *');
    sql.push('FROM', this.escape(this.collectionName));

    const filter = this._compile(ast);

    if (filter.sql) {
      sql.push('WHERE', filter.sql);
      params = params.concat(filter.params);
    }

    return {params, sql: `${sql.join(' ')};`};
  }

}

export default MySqlQueryBuilder;
