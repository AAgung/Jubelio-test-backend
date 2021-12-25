const Hapi = require('@hapi/hapi');

// controller require
const productController = require('./src/controllers/product.controller');

require('dotenv').config();

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

  server.route({
    method: 'GET',
    path: '/products',
    handler: productController.getProducts
  });

  await server.start();
  console.log(`Server running on ${server.info.uri}`);
}

init();