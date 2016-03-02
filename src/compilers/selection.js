import _ from 'lodash';
import CustomError from 'customerror';
import compileEqual from './equal';
import compileNotEqual from './notEqual';
import compileGreaterThan from './greaterThan';
import compileGreaterThanOrEqual from './greaterThanOrEqual';
import compileLessThan from './lessThan';
import compileLessThanOrEqual from './lessThanOrEqual';
import compileIn from './in';
import compileNotIn from './notIn';
import compileLike from './like';
import compileNotLike from './notLike';
import compileAnd from './and';
import compileOr from './or';

/**
 * Compiles and returns a parameterized SQL "selection" clause, based on the supplied AST.
 * @param {Array} ast abstract syntax tree, as given by the QueryParser.
 * @return {Object}
 */
function compile(ast: Array): Object {
  if (ast[0] !== 'SELECTION') {
    throw new CustomError(`Invalid abstract syntax tree; expected "SELECTION", received ${ast[0]}`, 'QueryCompileException');
  }

  if (_.isNil(ast[1])) {
    return {sql: '', params: []};
  }

  switch (ast[1][0]) {
  case 'EQ':
    return compileEqual(ast[1]);
  case 'NE':
    return compileNotEqual(ast[1]);
  case 'GT':
    return compileGreaterThan(ast[1]);
  case 'GTE':
    return compileGreaterThanOrEqual(ast[1]);
  case 'LT':
    return compileLessThan(ast[1]);
  case 'LTE':
    return compileLessThanOrEqual(ast[1]);
  case 'IN':
    return compileIn(ast[1]);
  case 'NIN':
    return compileNotIn(ast[1]);
  case 'LIKE':
    return compileLike(ast[1]);
  case 'NLIKE':
    return compileNotLike(ast[1]);
  case 'AND':
    return compileAnd(ast[1]);
  case 'OR':
    return compileOr(ast[1]);
  default:
    throw new CustomError(`Invalid abstract syntax tree; unknown identifier: ${ast[0]}`, 'QueryCompileException');
  }
}

export default compile;
