require('dotenv').load({ silent: true });
require('babel-core/register');

// load the test files
require('./querycompilers/key');
require('./querycompilers/selection');
require('./querycompilers/projection');
require('./querycompilers/orderby');
require('./querycompilers/find');
require('./querycompilers/count');
require('./querycompilers/remove');
require('./querycompilers/insert');
require('./querycompilers/upsert');
require('./querycompilers/update');
require('./database');
require('./collection');
