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
	db.runSql('CREATE ROLE api_user WITH LOGIN PASSWORD \'password\';');
	return db.runSql('ALTER ROLE api_user CREATEDB;', []);
};

exports.down = function(db) {
	return db.runSql('DROP ROLE api_user;', []);
};

exports._meta = {
	"version": 1
};
