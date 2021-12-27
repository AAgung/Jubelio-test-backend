const Hapi = require('@hapi/hapi');
const Joi = require('@hapi/joi');
const Inert = require('@hapi/inert');
const Path = require('path');

require('dotenv').config();

// controller require
const productController = require('./src/controllers/product.controller');

const init = async () => {
  const server = new Hapi.server({
    port: process.env.APP_PORT,
    host: 'localhost',
    routes: {
      cors: true,
      files: {
        relativeTo: Path.join(__dirname, 'public')
      },
      payload: {
        maxBytes: 104857600
      }
    },
  });

  await server.register(Inert);

  server.route({
    method: 'GET',
    path: '/{param*}',
    handler: {
      directory: {
          path: '.'
      }
    }
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
        output: 'stream',
        parse: true,
        multipart: true,
      },
      validate: {
        payload: Joi.object({
          sku: Joi.string().min(5).required(),
          name: Joi.string().min(3).required(),
          price: Joi.number().required(),
          description: Joi.optional(),
          image: Joi.optional(),
        }),
        failAction: (request, hapi, error) => {
          return hapi.response({
            success: false,
            message: `Validation error`,
            data: error.details
          }).takeover().code(400);
        }
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
        output: 'stream',
        parse: true,
        multipart: true,
      },
      validate: {
        payload: Joi.object({
          sku: Joi.string().min(5).required(),
          name: Joi.string().min(3).required(),
          price: Joi.number().required(),
          description: Joi.optional(),
          image: Joi.optional(),
        }),
        failAction: (request, hapi, error) => {
          return hapi.response({
            success: false,
            message: `Validation error`,
            data: error.details
          }).takeover().code(400);
        }
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