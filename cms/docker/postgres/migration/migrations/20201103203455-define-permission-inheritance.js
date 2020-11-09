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
	return db.createTable('permission-inheritance',
	{
		child_id: {
			type: 'int',
			primaryKey: true,
			foreignKey: {
				name: 'permission_inheritance_child_id_fk',
				table: 'permission',
				rules: {
					onDelete: 'RESTRICT',
					onUpdate: 'CASCADE'
				},
				mapping: 'id'
			}
		},
		parent_id: {
			type: 'int',
			primaryKey: true,
			foreignKey: {
				name: 'permission_inheritance_parent_id_fk',
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
	return db.dropTable('permission-inheritance');
};

exports._meta = {
	"version": 1
};
