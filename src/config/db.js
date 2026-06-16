const { Pool } = require('pg');
require('dotenv').config();

const isProduction = process.env.NODE_ENV === 'production';
const isMock = process.env.MOCK_DB === 'true';

let pool;

if (!isMock) {
  if (process.env.DATABASE_URL) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: isProduction ? { rejectUnauthorized: false } : false
    });
  } else {
    pool = new Pool({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME || 'stuntdruk',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      ssl: isProduction ? { rejectUnauthorized: false } : false
    });
  }
} else {
  // Mock pool interface for testing
  pool = {
    on: () => {},
    end: async () => {
      console.log('Mock database pool terminated.');
    }
  };
}

// In-memory data store for local testing mock mode
const mockDbStore = {
  users: [],
  products: []
};

// Mock Query Runner that intercepts SQL queries and processes them on mockDbStore
const runMockQuery = async (text, params) => {
  const queryNormalized = text.trim().replace(/\s+/g, ' ');
  
  if (queryNormalized.includes('CREATE TABLE IF NOT EXISTS')) {
    return { rows: [] };
  }

  // User checks
  if (queryNormalized.includes('SELECT id FROM users WHERE email = $1 OR username = $2')) {
    const email = params[0]?.toLowerCase();
    const username = params[1]?.toLowerCase();
    const found = mockDbStore.users.filter(u => u.email === email || u.username === username);
    return { rows: found };
  }

  // User details / logins
  if (queryNormalized.includes('SELECT id, username, email, password, created_at FROM users WHERE email = $1 OR username = $2')) {
    const ident = params[0]?.toLowerCase();
    const found = mockDbStore.users.filter(u => u.email === ident || u.username === ident);
    return { rows: found };
  }

  // Get active user me
  if (queryNormalized.includes('SELECT id, username, email, created_at FROM users WHERE id = $1')) {
    const id = parseInt(params[0], 10);
    const found = mockDbStore.users.filter(u => u.id === id);
    return { rows: found };
  }

  // User registration
  if (queryNormalized.includes('INSERT INTO users')) {
    const username = params[0];
    const email = params[1];
    const password = params[2];
    const user = {
      id: mockDbStore.users.length + 1,
      username,
      email,
      password,
      created_at: new Date().toISOString()
    };
    mockDbStore.users.push(user);
    return { rows: [user] };
  }

  // Products listing
  if (queryNormalized.includes('SELECT * FROM products ORDER BY created_at DESC')) {
    const sorted = [...mockDbStore.products].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    return { rows: sorted };
  }

  // Product detail (or exists check)
  if (queryNormalized.includes('SELECT * FROM products WHERE id = $1') || queryNormalized.includes('SELECT id FROM products WHERE id = $1')) {
    const id = parseInt(params[0], 10);
    const found = mockDbStore.products.filter(p => p.id === id);
    return { rows: found };
  }

  // Product creation
  if (queryNormalized.includes('INSERT INTO products')) {
    const name = params[0];
    const description = params[1];
    const price = parseFloat(params[2]);
    const stock_quantity = parseInt(params[3], 10);
    const product = {
      id: mockDbStore.products.length + 1,
      name,
      description,
      price,
      stock_quantity,
      created_at: new Date().toISOString()
    };
    mockDbStore.products.push(product);
    return { rows: [product] };
  }

  // Product updates
  if (queryNormalized.includes('UPDATE products')) {
    const name = params[0];
    const description = params[1];
    const price = parseFloat(params[2]);
    const stock_quantity = parseInt(params[3], 10);
    const id = parseInt(params[4], 10);
    const idx = mockDbStore.products.findIndex(p => p.id === id);
    if (idx !== -1) {
      mockDbStore.products[idx] = {
        ...mockDbStore.products[idx],
        name,
        description,
        price,
        stock_quantity
      };
      return { rows: [mockDbStore.products[idx]] };
    }
    return { rows: [] };
  }

  // Product deletion
  if (queryNormalized.includes('DELETE FROM products')) {
    const id = parseInt(params[0], 10);
    const idx = mockDbStore.products.findIndex(p => p.id === id);
    if (idx !== -1) {
      mockDbStore.products.splice(idx, 1);
    }
    return { rows: [] };
  }

  throw new Error(`Unsupported Mock SQL Query: ${text}`);
};

if (!isMock) {
  pool.on('error', (err) => {
    console.error('Unexpected error on idle database client', err);
  });
}

const initDb = async () => {
  if (isMock) {
    console.log('Running in MOCK database mode.');
    // Seed mock test admin user (admin / test12345)
    const adminUsername = 'admin';
    const adminEmail = 'admin@example.com';
    const bcrypt = require('bcryptjs');
    const salt = await bcrypt.genSalt(5); // Low salt for faster tests
    const hashedPassword = await bcrypt.hash('test12345', salt);
    
    mockDbStore.users.push({
      id: 1,
      username: adminUsername,
      email: adminEmail,
      password: hashedPassword,
      created_at: new Date().toISOString()
    });
    console.log('Seeded mock test admin user (admin / test12345).');
    return;
  }

  const client = await pool.connect();
  try {
    console.log('Successfully connected to the PostgreSQL database.');
    
    // Create users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Checked/Created "users" table.');

    // Create products table
    await client.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price NUMERIC(10, 2) NOT NULL,
        stock_quantity INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Checked/Created "products" table.');

    // Seed test admin user (admin / test12345)
    const adminUsername = 'admin';
    const adminEmail = 'admin@example.com';
    const adminCheck = await client.query('SELECT id FROM users WHERE username = $1', [adminUsername]);
    if (adminCheck.rows.length === 0) {
      const bcrypt = require('bcryptjs');
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('test12345', salt);
      await client.query(
        'INSERT INTO users (username, email, password) VALUES ($1, $2, $3)',
        [adminUsername, adminEmail, hashedPassword]
      );
      console.log('Seeded test admin user (admin / test12345).');
    }

  } catch (err) {
    console.error('Error initializing database tables:', err.message);
    throw err;
  } finally {
    client.release();
  }
};

module.exports = {
  query: (text, params) => {
    if (isMock) {
      return runMockQuery(text, params);
    }
    return pool.query(text, params);
  },
  pool,
  initDb
};
