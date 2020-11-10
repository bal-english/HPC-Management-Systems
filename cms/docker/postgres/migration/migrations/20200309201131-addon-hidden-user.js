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
	return db.createTable('hidden-user', {
		user_id: {
			type: 'int',
			primaryKey: true,
			foreignKey: {
				name: 'hidden_user_used_id_fk',
				table: 'user',
				rules: {
					onDelete: 'RESTRICT',
					onUpdate: 'CASCADE'
				},
				mapping: 'id'
			}
		},
		reason: {
			type: 'text'
		}
	});
};

exports.down = function(db) {
	return db.dropTable('hidden-user', {"ifExists": true});
};

exports._meta = {
	"version": 1
};
