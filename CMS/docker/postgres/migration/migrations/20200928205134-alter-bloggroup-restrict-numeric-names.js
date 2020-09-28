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
  return db.runSql('ALTER TABLE bloggroup ADD CONSTRAINT bloggroup_No_numeric_names CHECK (name NOT SIMILAR TO \'[0-9]+\')')
};

exports.down = function(db, callback) {
  return null;
};

exports._meta = {
  "version": 1
};
