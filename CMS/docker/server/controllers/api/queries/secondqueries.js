const Pool = require('pg').Pool;
const pool = new Pool();

const getBlogByCategory = (req, res) => {
	const category = req.params.category;
	pool.query('SELECT * FROM \"blog\" WHERE category == $category', (error, results) => {
		if(error){
			throw error;
		}
		res.status(200).json(results.rows);
	});
}
