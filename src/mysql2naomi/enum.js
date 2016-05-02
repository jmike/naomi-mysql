import _ from 'lodash';
import type from 'type-of';

const re = /(?:enum|set)\((?:'(.*)')\)/i;

/**
 * Transpiles the supplied metadata object to naomi datatype.
 * @param {Object} meta: the metadata object, as given in MySQL information schema.
 * @return {Array} an array with two (2) elements: name of the column and properties of the column.
 */
function transpile(meta) {
  if (!_.isObject(meta)) {
    throw new TypeError(`Invalid "meta" argument; expected object, received ${type(meta)}`);
  }

  const name = meta.COLUMN_NAME;
  const props = { type: 'enum' };

  props.nullable = meta.IS_NULLABLE === 'YES';

  const arr = meta.COLUMN_TYPE.match(re);
  if (arr !== null) {
    props.values = arr[1].split('\',\'');
  }

  if (meta.COLUMN_DEFAULT !== null) {
    props.default = meta.COLUMN_DEFAULT;
  }

  return [name, props];
}

export default transpile;
