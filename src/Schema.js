import {Schema} from 'naomi';

class MySqlSchema extends Schema {

  static fromMetaData(obj: Object): Schema {
    return new Schema(obj);
  }

}

export default MySqlSchema;
