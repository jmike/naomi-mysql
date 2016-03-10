import _ from 'lodash';
import Schema from 'naomi/src/Schema';

class MySqlSchema extends Schema {

  /**
   * Creates and returns a new Schema from the designated metadata.
   * @param {Array<Object>} columns an array of column properties as provided by MySQL.
   * @return {Schema}
   */
  static fromMetaData(columns: Array<Object>): Schema {
    // const reAutoInc = /auto_increment/i;
    // const reUnsigned = /unsigned/i;
    const definition = {};

    columns.forEach((e) => {
      const name = e.COLUMN_NAME;
      const props = {};

      switch (e.DATA_TYPE) {
      case 'tinyint':
        props.type = 'integer';

        if (e.COLUMN_TYPE.contains('unsigned')) {
          _.assign(props, min: 0, max: 255);
        } else {
          _.assign(props, min: -128, max: 127);
        }

        break;

      case 'smallint':
        props.type = 'integer';

        if (e.COLUMN_TYPE.contains('unsigned')) {
          _.assign(props, min: 0, max: 65535);
        } else {
          _.assign(props, min: -32768, max: 32767);
        }

        break;

      case 'mediumint':
        props.type = 'integer';

        if (e.COLUMN_TYPE.contains('unsigned')) {
          _.assign(props, min: 0, max: 16777215);
        } else {
          _.assign(props, min: -8388608, max: 8388607);
        }

        break;

      case 'int':
        props.type = 'integer';

        if (e.COLUMN_TYPE.contains('unsigned')) {
          _.assign(props, min: 0, max: 4294967295);
        } else {
          _.assign(props, min: -2147483648, max: 2147483647);
        }

        break;

      case 'bigint':
        props.type = 'integer';

        if (e.COLUMN_TYPE.contains('unsigned')) {
          _.assign(props, min: 0, max: 18446744073709551615);
        } else {
          _.assign(props, min: -9223372036854775808, max: 9223372036854775807);
        }

        break;
      default:
        throw new TypeError(`Unknown MySQL datatype ${e.DATA_TYPE}`);
      }

      if (e.IS_NULLABLE === 'YES') {
        props.optional = true;
      }

      if (e.COLUMN_DEFAULT !== null) {
        props.default = e.COLUMN_DEFAULT;
      }

      // return {
      //   type: e.DATA_TYPE,
      //   isNullable: record.IS_NULLABLE === 'YES',
      //   isAutoInc: re.test(record.EXTRA),
      //   default: record.COLUMN_DEFAULT,
      //   collation: record.COLLATION_NAME,
      //   comment: (record.COLUMN_COMMENT === '') ? null : record.COLUMN_COMMENT
      // };

      definition[name] = props;
    });

    return new Schema(definition);
  }

}

export default MySqlSchema;
