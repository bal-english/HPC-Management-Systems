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
	db.insert('permission', ['name'], ['superuser']);
	db.insert('permission', ['name'], ['db_admin']);
	db.insert('permission', ['name'], ['create_ticket']);
	db.insert('permission', ['name'], ['assign_ticket']);
	db.insert('permission', ['name'], ['process_ticket']);
	db.insert('permission', ['name'], ['manage_ticket']);
	db.insert('permission', ['name'], ['create_content']);
	db.insert('permission', ['name'], ['hide_content']);
	db.insert('permission', ['name'], ['delete_content']);
	db.insert('permission', ['name'], ['manage_content']);
	db.insert('permission', ['name'], ['create_user']);
	db.insert('permission', ['name'], ['hide_user']);
	db.insert('permission', ['name'], ['delete_user']);
	return db.insert('permission', ['name'], ['manage_user'], callback);
};

exports.down = function(db, callback) {
  return null;
};

exports._meta = {
  "version": 1
};
