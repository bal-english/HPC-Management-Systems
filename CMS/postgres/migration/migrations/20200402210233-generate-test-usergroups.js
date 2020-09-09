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
	/*
	db.insert('usergroup', ['name'], ['superuser']);
	db.insert('usergroup', ['name'], ['db_admin']);
	db.insert('usergroup', ['name'], ['ticket_admin']);
	db.insert('usergroup', ['name'], ['ticket_worker']);
	db.insert('usergroup', ['name'], ['content_admin']);
	db.insert('usergroup', ['name'], ['content_creator']);
	db.insert('usergroup', ['name'], ['su_faculty']);
	db.insert('usergroup', ['name'], ['su_student']);
	return db.insert('usergroup', ['name'], ['su_alumnus'], callback);
	*/
	return null;
};

exports.down = function(db, callback) {
  return null;
};

exports._meta = {
  "version": 1
};
