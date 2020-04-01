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
  db.createTable('user',
  {
    id: {
      type: 'int',
      primaryKey: true,
      autoIncrement: true
    },
    lastName: {
      type: 'text',
      notNull: true
    },
    firstName: {
      type: 'text',
      notNull: true
    },
    email: {
      type: 'text',
      notNull: true,
      unique: true
    }
  }, callback);
};

exports.down = function(db, callback) {
  db.dropTable('user', {}, callback);
};

exports._meta = {
  "version": 1
};
