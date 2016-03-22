import _ from 'lodash';

function extractKeysFromAST(ast: Array): Array<string> {
  let keys = [];

  if (ast[0] === 'KEY') {
    keys.push(ast[1]);
  } else {
    ast.forEach((e) => {
      if (_.isArray(e)) {
        const arr = extractKeysFromAST(e);

        if (arr.length !== 0) {
          keys = keys.concat(arr);
        }
      }
    });
  }

  return keys;
}

export default extractKeysFromAST;
