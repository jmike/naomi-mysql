import _ from 'lodash';
import type from 'type-of';

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
  const props = { type: 'date' };

  props.nullable = meta.IS_NULLABLE === 'YES';
  props.format = 'YYYY-MM-DD hh:mm:ss';
  props.min = '1970-01-01 00:00:01';
  props.max = '2038-01-19 03:14:07';

  if (meta.COLUMN_DEFAULT !== null) {
    props.default = meta.COLUMN_DEFAULT;
  }

  return [name, props];
}

export default transpile;
