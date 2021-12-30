const Lab = require('@hapi/lab');
const { expect } = require('@hapi/code');
const { before, after, afterEach, beforeEach, describe, it } = exports.lab = Lab.script();
const { init } = require('../lib/server');
const { development, test } = require('../knexfile');
const FormData = require('form-data');
const StreamToPromise = require('stream-to-promise');
const { Readable } = require('stream');
require('dotenv').config();

describe('jubelio test /', () => {

  let server, knex, knexDev;
  before(async () => {
    // make a database for testing
    knexDev = require('knex')(development);
    let existsDB = await knexDev.raw(`SELECT EXISTS (SELECT FROM pg_database WHERE datname = '${test.connection.database}')`)
    if(!existsDB.rows[0]?.exists) {
      await knexDev.raw('CREATE DATABASE ' + test.connection.database)
        .then(() => knexDev.destroy());

      knex = require('knex')(test);
      return knex.migrate.latest()
        .then(() => knex.destroy());
    }
  });

  beforeEach(async () => {
      server = await init();
  });

  afterEach(async () => {
      await server.stop();
  });

  after(async () => {
    knex = require('knex')(test);
    return knex.raw('TRUNCATE TABLE products')
        .then(() => knex.destroy());
  });

  it('access index', async () => {
      const res = await server.inject({
          method: 'GET',
          url: '/',
          headers: {
            Authorization: `Bearer ${process.env.APP_KEY}`
          }
      });
      expect(res.result).to.equal(`<h1>Welcome to Jubelio Test Api</h1>`);
  });

  it('create product with sku is empty', async () => {
    const formData = new FormData();
    formData.append('sku', '');
    formData.append('name', 'Product A');
    formData.append('price', 15000);
    formData.append('description', '');
    formData.append('image', '');

    StreamToPromise(formData).then(async function(payload) {
      const res = await server.inject({
        method: 'POST',
        url: '/products',
        headers: {
          Authorization: `Bearer ${process.env.APP_KEY}`,
          ...formData.getHeaders()
        },
        payload: Readable.from(payload.toString())
      });
      expect(res.statusCode).to.equal(400);
    });
  });

  it('create product', async () => {
    const formData = new FormData();
    formData.append('sku', 'B-00001');
    formData.append('name', 'Product A');
    formData.append('price', 15000);
    formData.append('description', '');
    formData.append('image', '');

    StreamToPromise(formData).then(async function(payload) {
      const res = await server.inject({
        method: 'POST',
        url: '/products',
        headers: {
          Authorization: `Bearer ${process.env.APP_KEY}`,
          ...formData.getHeaders()
        },
        payload: Readable.from(payload.toString())
      });
      expect(res.statusCode).to.equal(200);
    });
  });

  it('get product with page', async () => {
    const res = await server.inject({
        method: 'GET',
        url: '/products',
        headers: {
          Authorization: `Bearer ${process.env.APP_KEY}`
        },
        payload: {
          page: 1
        }
    });
    expect(res.statusCode).to.equal(200);
  });

  it('create product with sku exists', async () => {
    const formData = new FormData();
    formData.append('sku', 'B-00001');
    formData.append('name', 'Product B');
    formData.append('price', 20000);
    formData.append('description', '');
    formData.append('image', '');

    StreamToPromise(formData).then(async function(payload) {
      const res = await server.inject({
        method: 'POST',
        url: '/products',
        headers: {
          Authorization: `Bearer ${process.env.APP_KEY}`,
          ...formData.getHeaders()
        },
        payload: Readable.from(payload.toString())
      });
      expect(res.statusCode).to.equal(400);
    });
  });

  it('import product from elevania', async () => {
    const res = await server.inject({
        method: 'GET',
        url: '/products/import-from-elevania',
        headers: {
          Authorization: `Bearer ${process.env.APP_KEY}`
        },
    });
    expect(res.statusCode).to.equal(200);
  });

  it('update product', async () => {
    const formData = new FormData();
    formData.append('sku', 'B-00002');
    formData.append('name', 'Product Z');
    formData.append('price', 20000);
    formData.append('description', 'This is description');
    formData.append('image', '');

    StreamToPromise(formData).then(async function(payload) {
      const res = await server.inject({
        method: 'PUT',
        url: '/products/B-00001',
        headers: {
          Authorization: `Bearer ${process.env.APP_KEY}`,
          ...formData.getHeaders()
        },
        payload: Readable.from(payload.toString())
      });
      expect(res.statusCode).to.equal(200);
    });
  });
  
  it('update product with sku exists', async () => {
    const formData = new FormData();
    formData.append('sku', '28022696');
    formData.append('name', 'Product Z');
    formData.append('price', 20000);
    formData.append('description', 'This is description');
    formData.append('image', '');

    StreamToPromise(formData).then(async function(payload) {
      const res = await server.inject({
        method: 'PUT',
        url: '/products/B-00002',
        headers: {
          Authorization: `Bearer ${process.env.APP_KEY}`,
          ...formData.getHeaders()
        },
        payload: Readable.from(payload.toString())
      });
      expect(res.statusCode).to.equal(400);
    });
  });

  it('delete product', async () => {
    const res = await server.inject({
      method: 'DELETE',
      url: '/products/B-00002',
      headers: {
        Authorization: `Bearer ${process.env.APP_KEY}`,
      },
    });
    expect(res.statusCode).to.equal(200);
  });
});