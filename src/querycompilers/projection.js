import _ from 'lodash';
import CustomError from 'customerror';
import compileKey from './key';

/**
 * Compiles and returns a parameterized SQL "projection" clause, based on the supplied AST.
 * @param {Array} ast abstract syntax tree, as given by the QueryParser.
 * @return {Object}
 */
function compile(ast: Array): Object {
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
    const key = compileKey(e);
    sql.push(key.sql);
    params = params.concat(params);
  });

  return {params, sql: sql.join(', ')};
}

export default compile;
