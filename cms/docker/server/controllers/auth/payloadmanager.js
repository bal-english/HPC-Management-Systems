const paseto = require('paseto');
const {V2} = paseto;

// From: http://emailregex.com
//const email_regex = "(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])"

const payload_types = {"reg_auth": {"name": "reg_auth", "def_exp": 1440}, "login_auth": {"name": "login_auth", "def_exp": 30}, "passreset_auth": {"name": "passreset_auth", "def_exp": 30}};
const default_account_perms = []; //TODO add fetch from database
const construct = (email, type, expiration, extra_perms) => {
	/*if(extra_perms === undefined) {
		if(expiration === undefined) {
			expiration = payload_types[type].def_exp;
		} else {
			if(!Array.isArray(expiration)) {
				throw "4th argument left blank, and 
			} else if(expiration.every(i => typeof(i) == int)) {
				extra_perms = expiration;
			} else {
				throw "

	}*/

	// TODO: Improve errors
	if(payload_types[type] === undefined) {
		throw "ERR: Type not found"
	}
	if(expiration < 0) {
		throw "ERR: Invalid Expiration Time"
	}

	permissions = [];							//TODO Create array thats the union of default_account_perms and extra_perms
	exp = payload_types[type].def_exp;			// TODO Add check if non-default expiration was specified and assign
	const payload = {"type": payload_types[type].name, "email": email, "permissions": [], "expiration": exp}
	return payload;
}
const tokenize = async (payload, key) => {
	//console.log('Tokenizing Payload:');
	//console.log(payload);
	//console.log("with key: " + key);
	const token = await V2.sign(payload, key)
	console.log("Token: " + token);
	return token;
};

module.exports = {
	construct,
	tokenize
};
