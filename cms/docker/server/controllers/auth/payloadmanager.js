const paseto = require('paseto');
const { db } = require('../api/api.js')
const {V2} = paseto;

// From: http://emailregex.com
//const email_regex = "(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])"

// TODO add update email auth
const payload_types = {
	"reg_auth": {
		"name": "reg_auth",
		"def_exp": 1440
	},
	"login_auth": {
		"name": "login_auth",
		"def_exp": 30
	}/*,
	"passreset_auth": {
		"name": "passreset_auth",
		"def_exp": 30
	}*/
};

const payload_models = () => {
	return {
		"reg_auth": {
			"type": payload_types["reg_auth"].name,
			"email": "",
			"expiration": payload_types["reg_auth"].def_exp,
			"setup": {
				"usergroups": {
					"def": true,
					"extra": []
				},
				"permissions": {
					"def": true,
					"extra": []
				}
			}
		},
		"login_auth": {
			"type": payload_types["login_auth"].name,
			"email": "",
			"expiration": payload_types["login_auth"].def_exp,
			"extra_perms": []
		}
	}
}

const default_account_perms = Array.from(db.datareq.getPermissions_def(true));
const default_account_groups = Array.from(db.datareq.getUsergroups_def(true));

const construct = (type, email/*, expiration*/) => {
	if(type === undefined || payload_types[type] === undefined) {
		throw "Invalid Payload Type";
	}

	// TODO: Improve errors
	if(payload_types[type] === undefined) {
		throw "ERR: Type not found"
	}
	/*
	if(expiration < 0) {
		throw "ERR: Invalid Expiration Time"
	}
	*/
	payload = payload_models()[type];
	payload.email = email;

	return payload;
}

const tokenize = async (payload, key) => {
	//console.log('Tokenizing Payload:');
	//console.log(payload);
	//console.log("with key: " + key);
	const token = await V2.encrypt(payload, key)
	console.log("Token: " + token);
	return token;
};

const validate = async (token, key) => {
	const payload = await V2.decrypt(token, key)
	console.log("Payload: " + payload);
	return payload;
}

module.exports = {
	construct,
	tokenize,
	validate
};
