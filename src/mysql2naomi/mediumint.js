import _ from 'lodash';

/**
 * Transpiles the supplied metadata object to naomi datatype.
 * @param {Object} meta: the metadata object, as given in MySQL information schema.
 * @return {Array} an array with two (2) elements: name of the column and properties of the column.
 */
function transpile(meta: Object): Object {
  const name = meta.COLUMN_NAME;
  const props = {type: 'integer'};

  props.nullable = meta.IS_NULLABLE === 'YES';
  props.autoInc = meta.EXTRA.contains('auto_increment');

  if (meta.COLUMN_TYPE.contains('unsigned')) {
    _.assign(props, {min: 0, max: 16777215});
  } else {
    _.assign(props, {min: -8388608, max: 8388607});
  }

  if (meta.COLUMN_DEFAULT !== null) {
    props.default = meta.COLUMN_DEFAULT;
  }

  return [name, props];
}

export default transpile;
