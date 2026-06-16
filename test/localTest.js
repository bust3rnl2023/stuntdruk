// Set Mock Database environment variable before loading app
process.env.MOCK_DB = 'true';
process.env.JWT_SECRET = 'local_test_jwt_secret_key_12345';
process.env.PORT = '8888';

const http = require('http');
const app = require('../src/app');
const db = require('../src/config/db');

let server;

// Helper to make HTTP requests using Node.js client
const makeRequest = (method, path, headers = {}, body = null) => {
  return new Promise((resolve, reject) => {
    const defaultHeaders = {
      'Content-Type': 'application/json',
      ...headers
    };

    const options = {
      hostname: 'localhost',
      port: 8888,
      path: path,
      method: method,
      headers: defaultHeaders
    };

    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const parsedData = data ? JSON.parse(data) : null;
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: parsedData
          });
        } catch (e) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: data
          });
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
};

const runTests = async () => {
  try {
    // 1. Initialize Database & Start Server
    await db.initDb();
    server = app.listen(8888, '0.0.0.0', () => {
      console.log('Test server started on port 8888.');
    });

    console.log('\n--- STARTING INTEGRATION TESTS ---\n');

    let adminToken = '';
    let testProductId = null;

    // Test 1: Healthcheck
    console.log('Testing GET / (Healthcheck)...');
    const health = await makeRequest('GET', '/');
    if (health.statusCode === 200 && health.body.status === 'healthy') {
      console.log('✅ Healthcheck passed.');
    } else {
      throw new Error(`Healthcheck failed: ${JSON.stringify(health)}`);
    }

    // Test 2: Admin Login
    console.log('\nTesting POST /api/auth/login with test user (admin / test12345)...');
    const loginRes = await makeRequest('POST', '/api/auth/login', {}, {
      username: 'admin',
      password: 'test12345'
    });
    if (loginRes.statusCode === 200 && loginRes.body.token) {
      adminToken = loginRes.body.token;
      console.log('✅ Admin login succeeded.');
      console.log(`Token received: ${adminToken.substring(0, 15)}...`);
    } else {
      throw new Error(`Admin login failed: ${JSON.stringify(loginRes)}`);
    }

    // Test 3: List products (Anonymous)
    console.log('\nTesting GET /api/products (Anonymous - expect empty array)...');
    const listAnon = await makeRequest('GET', '/api/products');
    if (listAnon.statusCode === 200 && Array.isArray(listAnon.body) && listAnon.body.length === 0) {
      console.log('✅ List products (anonymous) succeeded.');
    } else {
      throw new Error(`List products failed: ${JSON.stringify(listAnon)}`);
    }

    // Test 4: Create product (Anonymous - should fail)
    console.log('\nTesting POST /api/products (Anonymous - expect failure)...');
    const createAnon = await makeRequest('POST', '/api/products', {}, {
      name: 'Stunt Book',
      price: 15.99,
      stock_quantity: 100
    });
    if (createAnon.statusCode === 401) {
      console.log('✅ Anonymous creation blocked correctly (401 Unauthorized).');
    } else {
      throw new Error(`Anonymous product creation should have been blocked: ${JSON.stringify(createAnon)}`);
    }

    // Test 5: Create product (Authenticated - should succeed)
    console.log('\nTesting POST /api/products (Authenticated - expect success)...');
    const createAuth = await makeRequest('POST', '/api/products', {
      'Authorization': `Bearer ${adminToken}`
    }, {
      name: 'Premium Flyer Print',
      description: 'Glossy A4 flyers for promotion',
      price: 49.99,
      stock_quantity: 500
    });
    if (createAuth.statusCode === 201 && createAuth.body.product) {
      testProductId = createAuth.body.product.id;
      console.log(`✅ Authenticated product creation succeeded. Product ID: ${testProductId}`);
    } else {
      throw new Error(`Authenticated product creation failed: ${JSON.stringify(createAuth)}`);
    }

    // Test 6: List products (Anonymous - should show the new product)
    console.log('\nTesting GET /api/products (Anonymous - expect 1 product)...');
    const listAnonWithProd = await makeRequest('GET', '/api/products');
    if (listAnonWithProd.statusCode === 200 && listAnonWithProd.body.length === 1) {
      console.log('✅ Product is visible publicly.');
      console.log(`Product: ${listAnonWithProd.body[0].name} - $${listAnonWithProd.body[0].price}`);
    } else {
      throw new Error(`Product list verification failed: ${JSON.stringify(listAnonWithProd)}`);
    }

    // Test 7: Update product (Authenticated - change price and stock)
    console.log(`\nTesting PUT /api/products/${testProductId} (Authenticated - update price and stock)...`);
    const updateAuth = await makeRequest('PUT', `/api/products/${testProductId}`, {
      'Authorization': `Bearer ${adminToken}`
    }, {
      price: 39.99,
      stock_quantity: 450
    });
    if (updateAuth.statusCode === 200 && updateAuth.body.product && parseFloat(updateAuth.body.product.price) === 39.99) {
      console.log('✅ Product update succeeded.');
      console.log(`New price: $${updateAuth.body.product.price}, New stock: ${updateAuth.body.product.stock_quantity}`);
    } else {
      throw new Error(`Product update failed: ${JSON.stringify(updateAuth)}`);
    }

    // Test 8: Delete product (Authenticated)
    console.log(`\nTesting DELETE /api/products/${testProductId} (Authenticated - expect success)...`);
    const deleteAuth = await makeRequest('DELETE', `/api/products/${testProductId}`, {
      'Authorization': `Bearer ${adminToken}`
    });
    if (deleteAuth.statusCode === 200) {
      console.log('✅ Product deletion succeeded.');
    } else {
      throw new Error(`Product deletion failed: ${JSON.stringify(deleteAuth)}`);
    }

    // Test 9: Get deleted product (should return 404)
    console.log(`\nTesting GET /api/products/${testProductId} (expect 404)...`);
    const getDeleted = await makeRequest('GET', `/api/products/${testProductId}`);
    if (getDeleted.statusCode === 404) {
      console.log('✅ Deleted product correctly returns 404.');
    } else {
      throw new Error(`Querying deleted product did not return 404: ${JSON.stringify(getDeleted)}`);
    }

    console.log('\n🎉 ALL TESTS PASSED SUCCESSFULLY! 🎉\n');
    cleanup(0);
  } catch (err) {
    console.error('\n❌ TEST SUITE FAILED:', err.message);
    cleanup(1);
  }
};

const cleanup = (exitCode) => {
  if (server) {
    server.close(() => {
      console.log('Test server shut down.');
      process.exit(exitCode);
    });
  } else {
    process.exit(exitCode);
  }
};

runTests();
