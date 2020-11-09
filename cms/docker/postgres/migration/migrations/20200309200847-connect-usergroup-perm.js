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
	return db.createTable('usergroup-permission',
	{
		group_id: {
			type: 'int',
			primaryKey: true,
			foreignKey: {
				name: 'usergroup_permission_group_id_fk',
				table: 'usergroup',
				rules: {
					onDelete: 'RESTRICT',
					onUpdate: 'CASCADE'
				},
				mapping: 'id'
			}
		},
		perm_id: {
			type: 'int',
			primaryKey: true,
			foreignKey: {
				name: 'usergroup_permission_perm_id_fk',
				table: 'permission',
				rules: {
					onDelete: 'RESTRICT',
					onUpdate: 'CASCADE'
				},
				mapping: 'id'
			}
		}
	});
};

exports.down = function(db) {
	return db.dropTable('usergroup-permission');
};

exports._meta = {
	"version": 1
};
