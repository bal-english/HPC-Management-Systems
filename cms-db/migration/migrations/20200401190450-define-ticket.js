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
	db.runSql("CREATE TYPE ticket_status AS ENUM ('queued', 'assigned', 'working', 'completed')");
	db.createTable('ticket',
	{
		id: {
			type: 'int',
			primaryKey: true,
			autoIncrement: true
		},
		status: {
			type: 'ticket_status',
			notNull: true,
			defaultValue: 'queued',
		},
		creator: {
			type: 'int',
			notNull: true,
			foreignKey: {
				name: 'ticket_creator_user_id_fk',
				table: 'user',
				rules: {
					onDelete: 'RESTRICT',
					onUpdate: 'CASCADE',
				},
				mapping: 'id'
			}
		},
		title: {
			type: 'text',
			notNull: 'true'
		},
		body: {
			type: 'text',
			notNull: 'true'
		}
	}, callback);
};

exports.down = function(db, callback) {
	db.dropTable('ticket', {});
	db.runSql("DROP TYPE ticket_status", [], callback);
};

exports._meta = {
	"version": 1
};
