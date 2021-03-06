import _ from 'lodash';
import CustomError from 'customerror';
import Schema from 'naomi/lib/Schema';
import mysql2naomi from './mysql2naomi';

class MySqlSchema extends Schema {

  static fromMetaData(metadata) {
    const definition = _.mapValues(metadata, (props) => {
      // get a transpile function for the designated datatype
      const transpile = mysql2naomi[props.DATA_TYPE];

      // make sure transpile function exists
      if (_.isUndefined(transpile)) {
        throw new CustomError(`Unknown datatype ${props.DATA_TYPE}; ` +
          'this is most likely a problem with naomi itself', 'UnknownDatatype');
      }

      return transpile(props);
    });

    return new MySqlSchema(definition);
  }

}

export default MySqlSchema;
