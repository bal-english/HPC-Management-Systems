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

exports.up = function(db) {
	db.insert('usergroup-permission', ['group_id','perm_id'], [0, 1]);
	db.insert('usergroup-permission', ['group_id','perm_id'], [0, 2]);
	db.insert('usergroup-permission', ['group_id','perm_id'], [0, 3]);
	db.insert('usergroup-permission', ['group_id','perm_id'], [0, 4]);
	db.insert('usergroup-permission', ['group_id','perm_id'], [0, 5]);
	db.insert('usergroup-permission', ['group_id','perm_id'], [0, 6]);
	db.insert('usergroup-permission', ['group_id','perm_id'], [0, 7]);
	db.insert('usergroup-permission', ['group_id','perm_id'], [0, 8]);
	db.insert('usergroup-permission', ['group_id','perm_id'], [0, 9]);
	db.insert('usergroup-permission', ['group_id','perm_id'], [0, 10]);
	db.insert('usergroup-permission', ['group_id','perm_id'], [0, 11]);
	db.insert('usergroup-permission', ['group_id','perm_id'], [0, 12]);
	db.insert('usergroup-permission', ['group_id','perm_id'], [0, 13]);
	db.insert('usergroup-permission', ['group_id','perm_id'], [0, 14]);

	db.insert('usergroup-permission', ['group_id','perm_id'], [8, 1]);	// ticket.create
	db.insert('usergroup-permission', ['group_id','perm_id'], [8, 8]);	// content.edit.self
	db.insert('usergroup-permission', ['group_id','perm_id'], [8, 10]);	// content.publish.self

	db.insert('usergroup-permission', ['group_id','perm_id'], [2, 2]);	// ticket.claim
	db.insert('usergroup-permission', ['group_id','perm_id'], [2, 5]);	// ticket.process.self

	
	db.insert('usergroup-permission', ['group_id','perm_id'], [1, 3]);
	db.insert('usergroup-permission', ['group_id','perm_id'], [1, 4]);
	db.insert('usergroup-permission', ['group_id','perm_id'], [1, 6]);
	

	db.insert('usergroup-permission', ['group_id','perm_id'], [3, 9]);
	db.insert('usergroup-permission', ['group_id','perm_id'], [3, 11]);
	db.insert('usergroup-permission', ['group_id','perm_id'], [3, 12]);

	return db.insert('usergroup-permission', ['group_id','perm_id'], [4, 7]);
};

exports.down = function(db) {
	return null;
};

exports._meta = {
	"version": 1
};
