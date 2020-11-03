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
	db.insert('permission', ['id', 'name'], [0, 'db.admin']);
	db.insert('permission', ['id', 'name'], [1, 'ticket.create']);
	db.insert('permission', ['id', 'name'], [2, 'ticket.claim']);
	db.insert('permission', ['id', 'name'], [3, 'ticket.assign']);
	db.insert('permission', ['id', 'name'], [4, 'ticket.process.self']);
	db.insert('permission', ['id', 'name'], [5, 'ticket.process.others']);
	db.insert('permission', ['id', 'name'], [6, 'ticket.manage']);
	db.insert('permission', ['id', 'name'], [7, 'content.create']);
	db.insert('permission', ['id', 'name'], [8, 'content.edit.self']);
	db.insert('permission', ['id', 'name'], [9, 'content.edit.others']);	
	db.insert('permission', ['id', 'name'], [10, 'content.hide.self']);
	db.insert('permission', ['id', 'name'], [11, 'content.hide.others']);
	db.insert('permission', ['id', 'name'], [12, 'content.manage']);
	db.insert('permission', ['id', 'name'], [13, 'user.hide.self']);
	return db.insert('permission', ['id', 'name'], [14, 'user.hide.others']);
};

exports.down = function(db, callback) {
  return null;
};

exports._meta = {
  "version": 1
};
