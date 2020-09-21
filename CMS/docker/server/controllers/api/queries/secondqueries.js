const Pool = require('pg').Pool;
const pool = new Pool();

const getBlogByGroup = (req, res) => {
	const group = req.params.groupId;
	pool.query('SELECT * FROM \"blog\" WHERE category == $group', (error, results) => {
		if(error){
			throw error;
		}
		res.status(200).json(results.rows);
	});
}

const getBlogById = (req, res) => {
	const id = parseInt(req.params.id);
	
	pool.query('SELECT * FROM \"\" WHERE id = $1', [id], (error, results) => {
		if(error){
		  throw error;
		}
		res.status(200).send(results.rows);
	})
}


