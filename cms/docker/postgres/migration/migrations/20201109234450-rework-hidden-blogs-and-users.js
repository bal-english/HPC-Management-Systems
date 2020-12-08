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
	db.dropTable('hidden-user');
	db.addColumn('user', 'deactivated',
	{
		type: 'boolean',
		notNull: true,
		defaultValue: false
	});
	db.addColumn('blog', 'hidden',
	{
		type: 'boolean',
		notNull: true,
		defaultValue: false
	});
	return db.createTable('user-deactivate-log', {
		subject: {
			type: 'int',
			primaryKey: true,
			foreignKey: {
				name: 'user-deactivate-log_user_id_fk',
				table: 'user',
				rules: {
					onDelete: 'RESTRICT',
					onUpdate: 'CASCADE'
				},
				mapping: 'id'
			}
		},
		time: {
			type: 'datetime',
			primaryKey: true,
      notNull: true,
      defaultValue: new String('(now() at time zone \'UTC\')')
		},
		origin: {
			type: 'int',
			primaryKey: true,
			foreignKey: {
				name: 'user-deactivate-log_origin_id_fk',
				table: 'user',
				rules: {
					onDelete: 'RESTRICT',
					onUpdate: 'CASCADE'
				},
				mapping: 'id'
			}
		},
		is_undo: {
			type: 'boolean',
			notNull: true,
			defaultValue: false
		},
		about: {
			type: 'text',
			notNull: true,
			defaultValue: ''
		}
	});
};

exports.down = function(db) {
	return db.dropTable('user-deactivate-log');
};

exports._meta = {
  "version": 1
};
