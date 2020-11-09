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
	db.createTable('ticket-user_assignee',
	{
		ticket_id: {
			type: 'int',
			primaryKey: true,
			foreignKey: {
				name: 'ticket_user_assignee_ticket_id_fk',
				table: 'ticket',
				rules: {
					onDelete: 'RESTRICT',
					onUpdate: 'CASCADE'
				},
				mapping: 'id'
			}
		},
		user_id: {
			type: 'int',
			primaryKey: true,
			foreignKey: {
				name: 'ticket_user_assignee_user_id_fk',
				table: 'user',
				rules: {
					onDelete: 'RESTRICT',
					onUpdate: 'CASCADE'
				},
				mapping: 'id'
			}
		}
	});
	return db.createTable('ticket-group_assignee',
	{
		ticket_id: {
			type: 'int',
			primaryKey: true,
			foreignKey: {
				name: 'ticket_group_assignee_ticket_id_fk',
				table: 'ticket',
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
				name: 'ticket_group_assignee_group_id_fk',
				table: 'usergroup',
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
	db.dropTable('ticket-user_assignee');
	return db.dropTable('ticket-group_assignee');
};

exports._meta = {
	"version": 1
};
