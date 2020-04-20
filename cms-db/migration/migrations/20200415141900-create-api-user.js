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
	db.runSql('CREATE ROLE api_user WITH LOGIN PASSWORD \'password\';', [], callback);
};

exports.down = function(db, callback) {
	db.runSql('DROP ROLE api_user;', [], callback);
};

exports._meta = {
  "version": 1
};
