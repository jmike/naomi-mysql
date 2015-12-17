import naomi from 'naomi';
import Database from './Database';

naomi.registerEngine('mysql', Database);

export default naomi;
