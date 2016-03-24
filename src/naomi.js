import naomi from 'naomi';
import MySqlDatabase from './Database';

export default naomi.registerDatabaseEngine('mysql', MySqlDatabase);
