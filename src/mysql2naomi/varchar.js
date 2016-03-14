/**
 * Transpiles the supplied metadata object to naomi datatype.
 * @param {Object} meta: the metadata object, as given in MySQL information schema.
 * @return {Array} an array with two (2) elements: name of the column and properties of the column.
 */
function transpile(meta: Object): Object {
  const name = meta.COLUMN_NAME;
  const props = {type: 'string'};

  props.nullable = meta.IS_NULLABLE === 'YES';
  props.maxLength = meta.CHARACTER_MAXIMUM_LENGTH;

  if (meta.COLUMN_DEFAULT !== null) {
    props.default = meta.COLUMN_DEFAULT;
  }

  return [name, props];
}

export default transpile;
