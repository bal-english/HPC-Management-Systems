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
	db.insert('user', ['lastName','firstName','email'], ['English','Brendan','benglish4@gulls.salisbury.edu'], callback);
	db.insert('user', ['lastName','firstName','email'], ['Burton','Grace','gburton@gulls.salisbury.edu']);
	db.insert('user', ['lastName','firstName','email'], ['Barnes','Randy','rbarnes4@gulls.salisbury.edu']);
	db.insert('user', ['lastName','firstName','email'], ['Anderson','Joseph','jtanderson@salisbury.edu']);
	return db.insert('user', ['lastName','firstName','email'], ['Quackenbush','Richard','rcquackenbush@salisbury.edu'], callback);
};

exports.down = function(db, callback) {
	return null;
};

exports._meta = {
  "version": 1
};
