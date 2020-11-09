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
	return db.createTable('blog-has-tag', {
		blog_id: {
			type: 'int',
			primaryKey: true,
			notNull: true,
			foreignKey: {
				name: 'blog_blogtag_blog_id_fk',
				table: 'blog',
				rules: {
					onDelete: 'RESTRICT',
					onUpdate: 'CASCADE'
				},
				mapping: 'id'
			}
		},
		tag_id: {
			type: 'text',
			primaryKey: true,
			notNull: true,
			foreignKey: {
				name: 'blog_blogtag_tag_id_fk',
				table: 'blogtag-dict',
				rules: {
					onDelete: 'RESTRICT',
					onUpdate: 'CASCADE'
				},
				mapping: 'tag'
			}
		}
	})
};

exports.down = function(db) {
	return db.dropTable('blog-has-tag');
};

exports._meta = {
	"version": 1
};
