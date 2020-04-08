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
	db.createTable('user-usergroup',
	{
		user_id: {
			type: 'int',
			primaryKey: true,
			foreignKey: {
				name: 'user_usergroup_user_id_fk',
				table: 'user',
				rules: {
					onDelete: 'RESTRICT',
					onUpdate: 'CASCADE'
				},
				mapping: 'id'
			}
		},
		group_id: {
			type: 'int',
			primaryKey: true,
			foreignKey: {
				name: 'user_usergroup_group_id_fk',
				table: 'usergroup',
				rules: {
					onDelete: 'RESTRICT',
					onUpdate: 'CASCADE'
				},
				mapping: 'id'
			}
		}
	}, callback);
};

exports.down = function(db, callback) {
  db.dropTable('user-usergroup', {}, callback);
};

exports._meta = {
  "version": 1
};
