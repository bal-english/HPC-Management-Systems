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
	db.insert('usergroup', ['id', 'name'], [0, 'admin']);
	db.insert('usergroup', ['id', 'name'], [1, 'support_admin']);
	db.insert('usergroup', ['id', 'name'], [2, 'support_worker']);
	db.insert('usergroup', ['id', 'name'], [3, 'content_mod']);
	db.insert('usergroup', ['id', 'name'], [4, 'content_creator']);
	db.insert('usergroup', ['id', 'name'], [5, 'faculty']);
	db.insert('usergroup', ['id', 'name'], [6, 'student']);
	db.insert('usergroup', ['id', 'name'], [7, 'alumnus']);
	db.insert('usergroup', ['id', 'name'], [8, 'user']);
	return db.insert('usergroup', ['id','name'], [9, 'unauth']);
};

exports.down = function(db, callback) {
  return null;
};

exports._meta = {
  "version": 1
};
