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
	db.insert('usergroup-permission', ['group_id', 'perm_id'], [1, 1]);
	db.insert('usergroup-permission', ['group_id', 'perm_id'], [2, 2]);
	db.insert('usergroup-permission', ['group_id', 'perm_id'], [3, 4]);
	db.insert('usergroup-permission', ['group_id', 'perm_id'], [3, 6]);
	db.insert('usergroup-permission', ['group_id', 'perm_id'], [5, 8]);
	db.insert('usergroup-permission', ['group_id', 'perm_id'], [5, 9]);
	db.insert('usergroup-permission', ['group_id', 'perm_id'], [5, 10]);

	db.insert('usergroup-permission', ['group_id', 'perm_id'], [6, 7]);


	db.insert('user-usergroup', ['user_id', 'group_id'], [1, 2]);
	db.insert('user-usergroup', ['user_id', 'group_id'], [1, 6]);
	db.insert('user-usergroup', ['user_id', 'group_id'], [1, 8]);
	
	db.insert('user-usergroup', ['user_id', 'group_id'], [2, 2]);
	db.insert('user-usergroup', ['user_id', 'group_id'], [2, 6]);
	db.insert('user-usergroup', ['user_id', 'group_id'], [2, 8]);
	
	db.insert('user-usergroup', ['user_id', 'group_id'], [3, 8]);
	db.insert('user-usergroup', ['user_id', 'group_id'], [4, 3]);
	db.insert('user-usergroup', ['user_id', 'group_id'], [4, 6]);
	db.insert('user-usergroup', ['user_id', 'group_id'], [4, 7]);
		
	db.insert('user-usergroup', ['user_id', 'group_id'], [5, 1]);
	return db.insert('user-usergroup', ['user_id', 'group_id'], [5, 9], callback);
};

exports.down = function(db, callback) {
  return null;
};

exports._meta = {
  "version": 1
};
