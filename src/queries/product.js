const db = require('../../config/database');
const table = 'products';

const getProducts = async (limit, offset) => {
  let query = `SELECT sku, name, price, image, description FROM ${table} ORDER BY sku ASC LIMIT $1 OFFSET $2`;
  await db.query(query, [limit, offset], (error, result) => {
    if (error) throw error;
    return result;
  });
}

module.exports = {
  getProducts
};