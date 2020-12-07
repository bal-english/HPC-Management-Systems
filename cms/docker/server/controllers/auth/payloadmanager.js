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
				"data": {
					"lastName": "",
					"firstName": ""
				},
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
			"lastNonce": "",
			"expiration": payload_types["login_auth"].def_exp,
			"extra_perms": []
		}
	}
}

const default_account_perms = Array.from(db.datareq.getPermissions_def(true));
const default_account_groups = Array.from(db.datareq.getUsergroups_def(true));

const construct = (type, email, nonce/*, expiration*/) => {
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
	if(payload.type == 'login_auth') {
		payload.lastNonce = parseInt(nonce);
	}


	return payload;
}

const tokenize = async (payload, key) => {
	const token = await V2.encrypt(payload, key)
	return token;
};

const validate = async (token, key) => {
	const payload = await V2.decrypt(token, key);
	return payload;
}

const authorityCheck = async (payload, perm_name) => {
	if(payload.type == "reg_auth") {
		throw "Not a valid token"
	}

	email_query = await db.datareq.getUserByEmail(payload.email).then(results => results.rows[0]);	// TODO: Add error handling
	user_id = email_query.id;
	perm_query = await db.datareq.getPermissionByName(perm_name).then(results => results.rows[0]); // TODO: Add error handling
	perm_id = perm_query.id;
	return db.perm.userHasPerm(user_id, perm_id);
}
const nonceCheck = async (user_id, curr_nonce) => {
	nonce = await db.datareq.getUserById(user_id).then(results => results.rows[0].nonce);
	return nonce == curr_nonce;
}
const process = async (req, res) => {
	var key = (await req.key);// delete req.key;
	payload = {};
	try {
		payload = await validate(req.query.token, key);
	} catch(err) {
		req.internal.banner = 'auth/failure_default';
		res.cookie('banner', req.internal.banner).set('cookie set');
		return {'res': res, 'req': req};
	}

	if(payload.type == payload_types.login_auth.name) {
		res.cookie('token', req.query.token).set('cookie set');
		req.internal.banner = 'auth/user_login/success_default';
		res.cookie('banner', req.internal.banner);
		return {'res': res, 'req': req};
	} else	if(payload.type == payload_types.reg_auth.name) {
		if(payload.email == '') {
			req.internal.banner = 'auth/user_reg/failure_default';
			res.cookie('banner', req.internal.banner).set('cookie set');
			res.clearCookie('token');
			return {'res': res, 'req': req};
		} else {
			//try {
				newuser = await db.create.user(payload.setup.data.lastName, payload.setup.data.firstName, payload.email).then(results => results.rows[0]);
				if(payload.setup.usergroups.def == true) {
					await db.datareq.getUsergroups_def('true').then(results => results.rows).then(results => {
						arr = [];
						results.forEach(element => {
							arr.push(element.id);
						})
						return arr;
					}).then(arr => {
						arr.forEach(async (element) =>{
							try {
								await db.create.connection.user_usergroup(newuser.id, element);
							} catch(err) {
								console.log(err);
							}
						})
					})
				}
				await payload.setup.usergroups.extra.forEach(async (element) => {
					try {
						await db.create.connection.user_usergroup(newuser.id, element);
					} catch(err) {
						console.log(err);
					}
				});
				// TODO: ADD default perms
				new_payload = construct('login_auth', payload.email, newuser.nonce);
				new_token = tokenize(new_payload, key);
				res.cookie('token', (await new_token)).set('cookie set');
				req.internal.banner = 'auth/user_reg/success_default';
				res.cookie('banner', req.internal.banner).set('cookie set');
				return {'res': res, 'req': req};
			}
			//} catch (err) {
					req.internal.banner = 'auth/user_reg/failure_default';
					res.cookie('banner', req.internal.banner).set('cookie set');
					res.clearCookie('token');
			//}
	}
	return {'res': res, 'req': req};
}

module.exports = {
	construct,
	tokenize,
	validate,
	authorityCheck,
	nonceCheck,
	process
};
