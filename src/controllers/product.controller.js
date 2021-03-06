const resultQuery = require('../queries/product');
const axios = require('axios');
const parseString = require('xml2js').parseString;
const uploadHandler = require('../helpers/upload-file');

require('dotenv').config();

/**
 * handler function using hapi.js
 * GET Product
 * default request => limit, offset
 * 
 */
const getProduct = async (request, hapi) => {
  let limit = request.query.length ? request.query.length : 12;
  let page = request.query.page ? request.query.page : 1;
  let offset = page <= 1 ? 0 : (page - 1) * limit;
  try {
    if(process.env.NODE_ENV == 'development') console.log(`get ${limit} product on page ${page}`);
    let result = await resultQuery.getProduct(limit, offset);
    return hapi.response({
      success: true,
      message: 'Fetching data is success',
      data: result.rowCount > 0 
        ? result.rows.map(product => {
          product.image = product.image ? uploadHandler.getFile(product.image) : null;
          return product;
        })
        : []
    });
  } catch (error) {
    if(process.env.NODE_ENV == 'development') console.log(error);
    return hapi.response({
      success: false,
      message: 'Internal server error'
    }).code(500);
  }
}

/**
 * handler function using hapi.js
 * CREATE Product
 * default request => sku (string), name (string), price (decimal), description (string), image (file)
 * 
 */
const createProduct = async (request, hapi) => {
  let payload = {
    sku: request.payload.sku,
    name: request.payload.name,
    price: request.payload.price,
    description: request.payload.description ? request.payload.description : null,
    image: null
  }
  try {
    if(process.env.NODE_ENV == 'development') console.log(`check sku ${payload.sku} exists`);
    let isSKUExists = await resultQuery.getProductByDynamicField(payload.sku, 'sku');
    if(isSKUExists.rowCount > 0) {
      return hapi.response({
        success: false,
        message: `SKU ${payload.sku} already exists, change to another SKU`
      }).code(400);
    }

    let payloadImage = request.payload.image;
    if(payloadImage) {
      if(payloadImage.hapi.filename != '') {
        if(process.env.NODE_ENV == 'development') console.log(`upload product image for sku ${payload.sku}`);
        await uploadHandler.handleFileUpload(request.payload.image, './public/uploads/product')
          .then((response) => {
            payload.image = response.data.pathfile;
          });
      }
    }

    if(process.env.NODE_ENV == 'development') console.log(`create product with sku ${payload.sku}`);
    let result = await resultQuery.createProduct(payload);
    return hapi.response({
      success: true,
      message: `Product has been created with SKU: ${payload.sku}`,
      data: payload
    });
  } catch (error) {
    if(process.env.NODE_ENV == 'development') console.log(error);
    return hapi.response({
      success: false,
      message: 'Internal server error'
    }).code(500);
  }
}

/**
 * handler function using hapi.js
 * SHOW Product
 * default request => sku
 */
 const getProductBySKU = async (request, hapi) => {
  let sku = request.params.sku;
  try {
    if(process.env.NODE_ENV == 'development') console.log(`get product with sku ${sku}`);
    let result = await resultQuery.getProductByDynamicField(sku, 'sku');
    if(result.rowCount <= 0) {
      return hapi.response({
        success: false,
        message: `Product with SKU ${sku} not found`
      }).code(400);
    }

    return hapi.response({
      success: true,
      message: `Fetching data product ${sku} is success`,
      data: result.rowCount == 1 
        ? result.rows.map(product => {
          product.image = product.image ? uploadHandler.getFile(product.image) : null;
          return product;
        })[0]
        : null
    });
  } catch (error) {
    if(process.env.NODE_ENV == 'development') console.log(error);
    return hapi.response({
      success: false,
      message: 'Internal server error'
    }).code(500);
  }
}

/**
 * handler function using hapi.js
 * UPDATE Product
 * default request => sku (string), name (string), price (decimal), description (string), image (file)
 * 
 */
 const updateProduct = async (request, hapi) => {
  let oldSKU = request.params.sku;
  let payload = {
    sku: request.payload.sku,
    name: request.payload.name,
    price: request.payload.price,
    description: request.payload.description ? request.payload.description : null,
    image: null
  }

  try {
    // check is sku that will updated is exists
    if(process.env.NODE_ENV == 'development') console.log(`check product with sku that will updated (${oldSKU}) is exists`);
    let isOldSKUExists = await resultQuery.getProductByDynamicField(oldSKU, 'sku');
    if(isOldSKUExists.rowCount <= 0) {
      return hapi.response({
        success: false,
        message: `Product with SKU ${oldSKU} not found`
      }).code(400);
    }

    // check is sku that will updated is exists and if current sku is changed condition
    if(process.env.NODE_ENV == 'development') console.log(`check product with sku that will updated (${payload.sku}) is exists and if current sku is changed condition`);
    let isSKUExists = await resultQuery.getProductByDynamicField(payload.sku, 'sku', 'update', oldSKU);
    if(isSKUExists.rowCount > 0) {
      return hapi.response({
        success: false,
        message: `SKU ${payload.sku} already exists, change to another SKU`
      }).code(400);
    }

    payload.image = isOldSKUExists.rows[0].image;
    let payloadImage = request.payload.image;
    if(payloadImage) {
      if(payloadImage.hapi.filename != '') {
        if(process.env.NODE_ENV == 'development') console.log(`upload product image for sku ${payload.sku}`);
        uploadHandler.removeFile(payload.image);
        await uploadHandler.handleFileUpload(request.payload.image, './public/uploads/product')
          .then((response) => {
            payload.image = response.data.pathfile;
          });
      }
    }

    if(process.env.NODE_ENV == 'development') console.log(payload.sku != oldSKU ? `update product with ${oldSKU} to new SKU ${payload.sku}` : `update product with ${payload.sku}`);
    let result = await resultQuery.updateProduct(payload, oldSKU);
    return hapi.response({
      success: true,
      message: payload.sku != oldSKU ? `Product with ${oldSKU} has been updated to new SKU ${payload.sku}` : `Product with ${payload.sku} has been updated`,
      data: payload
    });
  } catch (error) {
    if(process.env.NODE_ENV == 'development') console.log(error);
    return hapi.response({
      success: false,
      message: 'Internal server error'
    }).code(500);
  }
}

/**
 * handler function using hapi.js
 * DELETE Product
 * default request => sku (string)
 * 
 */
 const deleteProduct = async (request, hapi) => {
  let sku = request.params.sku;
  try {
    if(process.env.NODE_ENV == 'development') console.log(`check product with sku that will deleted (${sku}) is exists`);
    let isSKUExists = await resultQuery.getProductByDynamicField(sku, 'sku');
    if(isSKUExists.rowCount <= 0) {
      return hapi.response({
        success: false,
        message: `Product with SKU ${sku} not found`
      }).code(400);
    }

    if(isSKUExists.rows[0].image) uploadHandler.removeFile(isSKUExists.rows[0].image);
    let result = await resultQuery.deleteProduct(sku);
    return hapi.response({
      success: true,
      message: `Product with ${sku} has been deleted`,
      data: null
    });
  } catch (error) {
    if(process.env.NODE_ENV == 'development') console.log(error);
    return hapi.response({
      success: false,
      message: 'Internal server error'
    }).code(500);
  }
}

/**
 * handler function using hapi.js
 * IMPORT Product from ELEVANIA
 * 
 */
const importFromProductElevania = async (request, hapi) => {
  try {
    let imported = false;
    if(process.env.NODE_ENV == 'development') console.log(`fetching product from elevania`);
    await axios({
      method: 'get',
      url: process.env.ELEVANIA_API_URL + `/rest/prodservices/product/listing`,
      headers: {
        'openapikey': process.env.ELEVANIA_API_KEY
      },
    })
    .then(async (response) => {
      let elevaniaDataXML = response.data;
      if(process.env.NODE_ENV == 'development') console.log(`parse data xml format from elevania to array javascript`);
      parseString(elevaniaDataXML, async (error, result) => {
        if(error) {
          return hapi.response({
            success: false,
            message: `Fetching data from elevania failed`
          }).code(500);
        }

        // I assume this external API always return xml format value and never empty for the data 
        let elevaniaData = result.Products.product;
        if(elevaniaData.length > 0) {
          imported = true;
          if(process.env.NODE_ENV == 'development') console.log('elevania data: ', elevaniaData.length);
          for(product of elevaniaData) {
            await getProductBySKUfromElevania(product.prdNo[0])
              .then(
                (result) => {
                  if(process.env.NODE_ENV == 'development') console.log(result.message);
                },
                (error) => {
                  if(process.env.NODE_ENV == 'development') console.log(error);
                }
              );
          }
        }
      });
    });

    return hapi.response({
      success: true,
      message: imported ? 'Data has been imported' : 'No data has been imported',
      data: []
    });
  } catch (error) {
    if(process.env.NODE_ENV == 'development') console.log(error);
    return hapi.response({
      success: false,
      message: 'Internal server error'
    }).code(500);
  }
}

/**
* handler no exporting function using hapi.js
* IMPORT Product Detail from ELEVANIA
* return Promise
*/
const getProductBySKUfromElevania = (sku, hapi) => {
  return new Promise((resolve, reject) => {
    try {
      axios({
        method: 'get',
        url: process.env.ELEVANIA_API_URL + `/rest/prodservices/product/details/${sku}`,
        headers: {
          'openapikey': process.env.ELEVANIA_API_KEY
        },
      })
      .then(async (response) => {
        let elevaniaDataXML = response.data;
        if(process.env.NODE_ENV == 'development') console.log(`parse data xml format from elevania with sku ${sku} to object javascript`);
        parseString(elevaniaDataXML, async (error, result) => {
          let elevaniaData = result.Product;
          if(elevaniaData) {  
            let productDataImported = {
              sku: elevaniaData.prdNo[0],
              name: elevaniaData.prdNm[0],
              price: elevaniaData.selPrc[0],
              description: elevaniaData.htmlDetail ? elevaniaData.htmlDetail[0] : null,
              image: elevaniaData.prdImage01 ? elevaniaData.prdImage01[0] : null,
            };

            // check if sku is exists
            if(process.env.NODE_ENV == 'development') console.log(`create or update imported data to database for sku ${productDataImported.sku}`);
            let isSKUExists = await resultQuery.getProductByDynamicField(productDataImported.sku, 'sku');
            if(isSKUExists.rowCount <= 0) {
              await resultQuery.createProduct(productDataImported);
              resolve({
                success: true, 
                message: 'create product', 
              })
            } else {
              await resultQuery.updateProduct(productDataImported, productDataImported.sku);
              resolve({
                success: true, 
                message: 'update product', 
              });
            }
          } else {
            reject({
              success: false,
              message: `Fetching data from elevania failed`
            });
          }
        });
      });
    } catch (error) {
      if(process.env.NODE_ENV == 'development') console.log(error);
      reject({
        success: false,
        message: 'Internal server error'
      });
    }
  });  
}

module.exports = {
  getProduct,
  createProduct,
  getProductBySKU,
  updateProduct,
  deleteProduct,
  importFromProductElevania
};