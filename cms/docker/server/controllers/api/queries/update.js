const Pool = require('pg').Pool;
const pool = new Pool();

const makeNonce = () => {
	return parseInt(Math.floor(Math.random()*4294967296)-2147483648);
}

const user = {
  'nonce': async (user_id) => {
    const newnonce = parseInt(makeNonce());
    return pool.query('UPDATE \"user\" SET nonce=$1 WHERE id=$2', [newnonce, user_id]);
  }
}

module.exports = {
  user
};
