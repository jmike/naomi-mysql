## 2.2.2 - 2016-06-08

* Bugfix: invalid function reference.

## 2.2.1 - 2016-05-05

* Remove src/naomi.js completely - use lib/Database.js as the main entry point.

## 2.2.0 - 2016-05-05

* Implement Database#executeStream(), Collection#findStream(), Database#schema().
* Do not wait for database connection - throw error instead.

## 2.1.0 - 2016-05-02

* Change babel settings to produce code compatible with node v.4+.
* Update eslint settings - use the latest airbnb styleguide.
* Update dependencies: lodash@4.11.2, bluebird@3.3.5, naomi@2.2.0.
* Add naomi-docs as homepage to package.json.
* Remove gulp - use npm scripts instead.

## 2.0.4 - 2016-03-24

* Validate only keys included in the update attrs
* Update dependencies: naomi@2.0.1.
* Extract primary key from the joi-validated values; not the initial records

## 2.0.3 - 2016-03-24

* Update dependencies: naomi@2.0.0

## 2.0.2 - 2016-03-24

* Update dependencies: naomi@2.0.0-beta.6.

## 2.0.1 - 2016-03-24

* Bugfix: naomi.js breaks on load.
* Update dependencies: naomi@2.0.0-beta.5.

## 2.0.0 - 2016-03-24

* Basic CRUD + Count functionality to handle a MySQL database.
