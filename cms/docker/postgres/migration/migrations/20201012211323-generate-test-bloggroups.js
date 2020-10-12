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

exports.up = function(db,callback) {
	db.insert('bloggroup', ['name', 'parent'], ['group1', 0], callback);
	db.insert('bloggroup', ['name', 'parent'], ['group2', 0], callback);
	db.insert('bloggroup', ['name', 'parent'], ['test', 0], callback);
	return db.insert('bloggroup', ['name', 'parent'], ['geometry', 0], callback);
};

exports.down = function(db,callback) {
	return null;
};

exports._meta = {
  "version": 1
};
