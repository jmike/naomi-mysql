import _ from 'lodash';

/**
 * Transpiles the supplied metadata object to naomi datatype.
 * @param {Object} meta: the metadata object, as given in MySQL information schema.
 * @return {Array} an array with two (2) elements: name of the column and properties of the column.
 */
function transpile(meta: Object): Object {
  const name = meta.COLUMN_NAME;
  const props = {type: 'float'};

  props.precision = meta.NUMERIC_PRECISION;
  props.scale = meta.NUMERIC_SCALE;
  props.nullable = meta.IS_NULLABLE === 'YES';

  if (meta.COLUMN_TYPE.contains('unsigned')) {
    _.assign(props, {min: 0});
  }

  if (meta.COLUMN_DEFAULT !== null) {
    props.default = meta.COLUMN_DEFAULT;
  }

  return [name, props];
}

export default transpile;
