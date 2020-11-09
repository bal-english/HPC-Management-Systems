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
	db.runSql('UPDATE permission SET \"desc\" = $1 WHERE id=0', ["Make changes to the database."]);
	db.runSql('UPDATE permission SET \"desc\" = $1 WHERE id=1', ["Create ticket objects."]);
	db.runSql('UPDATE permission SET \"desc\" = $1 WHERE id=2', ["Claim tickets that are marked as being \"claimable\", therby assigning that ticket to themself."]);
	db.runSql('UPDATE permission SET \"desc\" = $1 WHERE id=3', ["View the tickets and their statuses of other support workers."]);
	db.runSql('UPDATE permission SET \"desc\" = $1 WHERE id=4', ["Assign a ticket to a particular user or group."]);
	db.runSql('UPDATE permission SET \"desc\" = $1 WHERE id=5', ["Update the status of tickets they have been directly or group-wise assigned to."]);
	db.runSql('UPDATE permission SET \"desc\" = $1 WHERE id=6', ["Update the status of any ticket, including those that are not directly or group-wise assigned to them."]);
	db.runSql('UPDATE permission SET \"desc\" = $1 WHERE id=7', ["Create new blog content."]);
	db.runSql('UPDATE permission SET \"desc\" = $1 WHERE id=8', ["Revise and change the content of any previously-posted blog authored by the user with this permission (even if that user no longer has access to content.create)."]);
	db.runSql('UPDATE permission SET \"desc\" = $1 WHERE id=9', ["Revise and change the content of any previously-posted blog, including those that are not authored by the user with this permission."]);
	db.runSql('UPDATE permission SET \"desc\" = $1 WHERE id=10', ["(Bidirectionally) Update the discoverability of a any previously-posted blog authored by the user with this permission (even if the user does not have access to content.edit.self or content.create)."]);
	db.runSql('UPDATE permission SET \"desc\" = $1 WHERE id=11', ["(Bidirectionally) Update the discoverability of a any previously-posted blog, including those that are not authored by the user with this permission."]);
	db.runSql('UPDATE permission SET \"desc\" = $1 WHERE id=12', ["Remove public accessibility to a blog, including those that are not authored by the user with this permission. This action is the closest a blog can come to being deleted."]);
	db.runSql('UPDATE permission SET \"desc\" = $1 WHERE id=13', ["Effectively \"delete\" the account of the user with this permission. Removes public accessibility to the user's account and their blog content. This action is not bidirectional."]);
	return db.runSql('UPDATE permission SET \"desc\" = $1 WHERE id=14', ["Effectively \"delete\" the account of any user. Removes public accessibility to the user's account and their blog content. This action is not bidirectional."]);
};

exports.down = function(db) {
	return null;
};

exports._meta = {
	"version": 1
};
