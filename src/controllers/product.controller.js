const resultQuery = require('../queries/product');

/**
 * handler function using hapi.js
 * GET Product
 * default request => limit, offset
 * 
 */
const getProducts = async (request, hapi) => {
  const limit = request.query.length ? request.query.length : 12;
  const page = request.query.page ? request.query.page : 1;
  const offset = page <= 1 ? 0 : (page - 1) * limit;
  try {
    const result = await resultQuery.getProducts(limit, offset);
    return hapi.response({
      success: true,
      message: 'Fetching data is success',
      data: result ? result.rows : []
    });
  } catch (error) {
    return hapi.response({
      success: false,
      message: 'Internal server error'
    });
  }
}

/**
 * handler function using hapi.js
 * Import Product from ELEVANIA
 * 
 */
 const importProductsFromElevania = async (request, hapi) => {
  const limit = request.query.limit ? request.query.limit : 12;
  const offset = request.query.offset ? request.query.offset : 0;
  try {
    const result = await resultQuery.getProducts(limit, offset);
    return hapi.response({
      success: true,
      message: 'Fetching data is success',
      data: result ? result.rows : []
    });
  } catch (error) {
    return hapi.response({
      success: false,
      message: 'Internal server error'
    });
  }
}

module.exports = {
  getProducts,
  importProductsFromElevania
};