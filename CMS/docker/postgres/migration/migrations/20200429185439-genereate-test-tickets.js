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
  db.insert('ticket', ['creator','title','body'], [1,'Unable to log into linux account','Hello,\n for some reason I am unable to log into my account on the school\'s linux server. When I attempt to do so, it appears to start loading, but remains that way forever.']);
  return db.insert('ticket', ['creator','title','body'], [4,'Unable to do this thing that I should be able to do','Currently unable to do this thing that I definitely should be able to do. I know because I just did this thing yesterday. Could this be a permissions issue with my CMS user account?'], callback);
};

exports.down = function(db, callback) {
  return null;
};

exports._meta = {
  "version": 1
};
