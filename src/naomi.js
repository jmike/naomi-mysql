import naomi from 'naomi';
import MySqlDatabase from './Database';

naomi = naomi.registerDatabaseEngine('mysql', MySqlDatabase);

export default naomi;
