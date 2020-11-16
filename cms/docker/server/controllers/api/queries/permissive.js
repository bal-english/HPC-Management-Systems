const { getPermissionsOfUser, getUsergroupsOfUser, getPermissionsOfUsergroup } = require('./objective')

const Pool = require('pg').Pool;
const pool = new Pool();

let addperms_json = async function(permset, results) {
	//perm_set = new Set();
	results.forEach(element => {
		permset.add(element.perm_id);
	})
	return permset;
}

let addperms_arr = async function(permset, arr) {
	arr.forEach(element => {
		element = parseInt(element);	// TODO: Add Error Handling
		permset.add(element);
	})
	return permset;
}

const union = (a_, b_) => {
	const a = Array.from(a_);
	const b = Array.form(b_);

	permset = addperms(new Set(), a);
	permset = addperms(permset, b);

	return permset;
}

const getUserPermSet = async (user_id, full) => {
		return getPermissionsOfUser(user_id).then(results => addperms_json(new Set(), results.rows)).then(async permset => {
			if(full == true || full == 'true' || full == 'True' || full == "TRUE") {
				permset = await getUsergroupsOfUser(user_id).then(results => results.rows).then(async results => {
					for (const element of results) {
						await addperms_json(permset, await getPermissionsOfUsergroup(element.group_id).then(results2 => results2.rows));
					}
					return permset
				})
			}
			return permset;
		});
}

const getGroupPermSet = async (group_id) => {
	return getPermissionsOfUsergroup(group_id).then(results => addperms_json(new Set(), results.rows)).then(permset => res.status(200).json(Array.from(permset)));
}

module.exports = {
	union,
	getUserPermSet,
	getGroupPermSet
}
