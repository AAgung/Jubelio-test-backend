const db = require('../../config/database');
const table = 'products';

const getProduct = async (limit, offset) => {
  let query = `SELECT sku, name, price, image, description FROM ${table} ORDER BY "updatedAt" DESC, price ASC, name ASC LIMIT $1 OFFSET $2`;
  return await db.query(query, [limit, offset]);
}

const getProductByDynamicField = async (value, field = 'id', mode = 'create', oldValue) => {
  let query = `SELECT sku, name, price, image, description FROM ${table} WHERE ${field} = $1`;
  let params = [value];
  if(mode == 'update') {
    query += ` AND ${field} <> $2`;
    params.push(oldValue);
  }
  return await db.query(query, params);
}

const createProduct = async (obj) => {
  let query = `INSERT INTO ${table} (sku, name, price, image, description) VALUES ($1, $2, $3, $4, $5)`;
  return await db.query(query, [
    obj.sku, 
    obj.name, 
    obj.price, 
    obj.image, 
    obj.description
  ]);
}

const updateProduct = async (obj, oldSKU) => {
  let query = 'UPDATE products SET sku = $1, name = $2, price = $3, image = $4, description = $5, "updatedAt" = NOW() WHERE sku = $6';
  return await db.query(query, [
    obj.sku, 
    obj.name, 
    obj.price, 
    obj.image, 
    obj.description,
    oldSKU
  ]);
}

const deleteProduct = async (sku) => {
  let query = `DELETE FROM ${table} WHERE sku = $1`;
  return await db.query(query, [sku]);
}

module.exports = {
  getProduct,
  getProductByDynamicField,
  createProduct,
  updateProduct,
  deleteProduct
};