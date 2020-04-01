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
  db.createTable('blog', {
    id: {
      type: 'int',
      primaryKey: true,
      autoIncrement: true
    },
    posttime: {
      type: 'timestamp',
      notNull: true
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
  }, callback);
};

exports.down = function(db, callback) {
  db.dropTable('blog', {}, callback);
};

exports._meta = {
  "version": 1
};
