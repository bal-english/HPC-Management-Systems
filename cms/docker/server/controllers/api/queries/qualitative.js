const Pool = require('pg').Pool;
const pool = new Pool();

const getUserCount = (req, res) => {
	pool.query('SELECT count(*) FROM \"user\"', [], (error, results) => {
		if(error) {
			throw error;
		}
		res.status(200).json(results.rows[0]);
	});
}

module.exports = {
	getUserCount
}