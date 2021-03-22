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
  return db.createTable('thread-reply', {
    parent: {
      type: 'int',
      primaryKey: true,
      foreignKey: {
        name: 'thread-reply_parent_id_fk',
        table: 'permission',
        rules: {
          onDelete: 'RESTRICT',
          onUpdate: 'CASCADE'
        },
        mapping: 'id'
      }
    },
    id: {
      type: 'int',
      primaryKey: true,
      autoIncrement: true
    },
    author: {
      type: 'int',
      foreignKey: {
        name: 'thread-reply_author_id_fk',
        table: 'user',
        rules: {
          onDelete: 'RESTRICT',
          onUpdate: 'CASCADE'
        },
        mapping: 'id'
      }
    },
		posttime: {
			type: 'timestamp',
			notNull: false,
	    defaultValue: new String('(now() at time zone \'UTC\')')
		},
    body: {
      type: 'text',
      notNull: 'true'
    }
  });
};

exports.down = function(db) {
  return db.dropTable('thread-reply', {});
};

exports._meta = {
  "version": 1
};
