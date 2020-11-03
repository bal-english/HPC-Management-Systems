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
	db.insert('usergroup', ['name'], ['admin']);
	db.insert('usergroup', ['name'], ['support_admin']);
	db.insert('usergroup', ['name'], ['support_worker']);
	db.insert('usergroup', ['name'], ['faculty']);
	db.insert('usergroup', ['name'], ['student']);
	db.insert('usergroup', ['name'], ['user']);
	return db.insert('usergroup', ['name'], ['unauth']);
};

exports.down = function(db, callback) {
  return null;
};

exports._meta = {
  "version": 1
};
