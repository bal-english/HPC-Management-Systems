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
	return db.createTable('blog', {
		id: {
			type: 'int',
			primaryKey: true,
			autoIncrement: true
		},
		posttime: {
			type: 'timestamp',
			notNull: false,
	    defaultValue: new String('(now() at time zone \'UTC\')')
		},
		title: {
			type: 'text',
			notNull: true
		},
		author: {
			type: 'int',
			notNull: true,
			foreignKey: {
				name: 'blog_author_user_id_fk',
				table: 'user',
				rules: {
					onDelete: 'RESTRICT',
					onUpdate: 'CASCADE'
				},
				mapping: 'id'
			}
		},
		group: {
			type: 'int',
			notNull: true,
			foreignKey: {
				name: 'blog_group_bloggroup_id_fk',
				table: 'bloggroup',
				rules: {
					onDelete: 'RESTRICT',
					onUpdate: 'CASCADE'
				},
				mapping: 'id'
			}
		},
		body: {
			type: 'text',
			notNull: 'true'
		}
	});
};

exports.down = function(db) {
	return db.dropTable('blog');
};

exports._meta = {
	"version": 1
};
