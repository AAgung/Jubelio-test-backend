const Hapi = require('@hapi/hapi');

require('dotenv').config();

// controller require
const productController = require('./src/controllers/product.controller');

const init = async () => {
  const server = new Hapi.server({
    port: process.env.APP_PORT,
    host: 'localhost'
  });

  server.route({
    method: 'GET',
    path: '/',
    handler: async (request, hapi) => {
      return `<h1>Welcome to Jubelio Test Api</h1>`;
    }
  });

  /**
   * PRODUCT ROUTE
   * 
   * GET all product
   */
  server.route({
    method: 'GET',
    path: '/products',
    handler: productController.getProduct
  });

  // CREATE product
  server.route({
    method: 'POST',
    path: '/products',
    config: {
      payload: {
        output: 'file',
        parse: true,
        multipart: true,
      }
    },
    handler: productController.createProduct
  });

  // GET product by sku
  server.route({
    method: 'GET',
    path: '/products/{sku}',
    handler: productController.getProductBySKU
  });

  // UPDATE product
  server.route({
    method: 'PUT',
    path: '/products/{sku}',
    config: {
      payload: {
        output: 'file',
        parse: true,
        multipart: true,
      }
    },
    handler: productController.updateProduct
  });

  // DELETE product by sku
  server.route({
    method: 'DELETE',
    path: '/products/{sku}',
    handler: productController.deleteProduct
  });

  // IMPORT product from elevania
  server.route({
    method: 'GET',
    path: '/products/import-from-elevania',
    handler: productController.importFromProductElevania
  });

  // START SERVER
  await server.start();
  console.log(`Server running on ${server.info.uri}`);
}

init();