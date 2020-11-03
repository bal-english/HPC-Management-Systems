'use strict';

var dbm;
var type;
var seed;

/**
  * We receive the dbmigrate dependency from dbmigrate initially.
  * This enables us to not have to rely on NODE_PATH.
  */
exports.setup = function(options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = function(db, callback) {
	return db.runSql('ALTER TABLE permission ADD CONSTRAINT permission_unique_names UNIQUE (name)')
};

exports.down = function(db, callback) {
	return null;
};

exports._meta = {
  "version": 1
};
