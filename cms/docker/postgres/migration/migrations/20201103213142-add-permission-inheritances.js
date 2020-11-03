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
	// TODO: change the third array to numeric ids
	//db.insert('permission-inheritance', ['child_id', 'parent_id'], ['ticket.claim', 'ticket.process.self']);
	//db.insert('permission-inheritance', ['child_id', 'parent_id'], ['ticket.manage', 'ticket.process.self']);
	//db.insert('permission-inheritance', ['child_id', 'parent_id'], ['ticket.manage', 'ticket.process.others']);
	//db.insert('permission-inheritance', ['child_id', 'parent_id'], ['ticket.manage', 'ticket.process.self']);
	return null;
};

exports.down = function(db, callback) {
  return null;
};

exports._meta = {
  "version": 1
};
