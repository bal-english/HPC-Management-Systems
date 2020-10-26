const Pool = require('pg').Pool;
const pool = new Pool();

const checkUserExistsByEmail = (req, res) => {
	email = req.params.email;
	pool.query('SELECT * FROM \"user\" WHERE email=$1', [email], (error, results) => {
		if(error) {
			throw error;
		}
		if(results.rows.length == 0) {
			res.sendStatus(404)
		} else if(results.rows.length == 1) {
			res.status(200).json(results.rows[0])
		} else {
			res.status(409).send('Multiple users found with that email');
		}
	});
}

module.exports = {
	checkUserExistsByEmail
}