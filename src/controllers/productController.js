const db = require('../config/db');

// Get all products (Public)
exports.getAllProducts = async (req, res, next) => {
  try {
    const result = await db.query('SELECT * FROM products ORDER BY created_at DESC');
    res.status(200).json(result.rows);
  } catch (err) {
    next(err);
  }
};

// Get a single product by ID (Public)
exports.getProductById = async (req, res, next) => {
  const { id } = req.params;

  try {
    const result = await db.query('SELECT * FROM products WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found.' });
    }

    res.status(200).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};

// Create a new product (Authenticated only)
exports.createProduct = async (req, res, next) => {
  const { name, description, price, stock_quantity } = req.body;

  // Validation
  if (!name) {
    return res.status(400).json({ error: 'Product name is required.' });
  }
  if (price === undefined || price === null || isNaN(Number(price)) || Number(price) < 0) {
    return res.status(400).json({ error: 'Product price must be a valid non-negative number.' });
  }
  if (stock_quantity === undefined || stock_quantity === null || !Number.isInteger(Number(stock_quantity)) || Number(stock_quantity) < 0) {
    return res.status(400).json({ error: 'Stock quantity must be a non-negative integer.' });
  }

  try {
    const result = await db.query(
      'INSERT INTO products (name, description, price, stock_quantity) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, description || '', price, stock_quantity]
    );

    res.status(201).json({
      message: 'Product created successfully.',
      product: result.rows[0]
    });
  } catch (err) {
    next(err);
  }
};

// Update an existing product (Authenticated only)
exports.updateProduct = async (req, res, next) => {
  const { id } = req.params;
  const { name, description, price, stock_quantity } = req.body;

  try {
    // Check if product exists
    const checkResult = await db.query('SELECT * FROM products WHERE id = $1', [id]);
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found.' });
    }

    const currentProduct = checkResult.rows[0];

    // Prepare fields to update
    const updatedName = name !== undefined ? name : currentProduct.name;
    const updatedDescription = description !== undefined ? description : currentProduct.description;
    const updatedPrice = price !== undefined ? price : currentProduct.price;
    const updatedStock = stock_quantity !== undefined ? stock_quantity : currentProduct.stock_quantity;

    // Validation on updated values
    if (!updatedName) {
      return res.status(400).json({ error: 'Product name cannot be empty.' });
    }
    if (isNaN(Number(updatedPrice)) || Number(updatedPrice) < 0) {
      return res.status(400).json({ error: 'Product price must be a valid non-negative number.' });
    }
    if (!Number.isInteger(Number(updatedStock)) || Number(updatedStock) < 0) {
      return res.status(400).json({ error: 'Stock quantity must be a non-negative integer.' });
    }

    const result = await db.query(
      'UPDATE products SET name = $1, description = $2, price = $3, stock_quantity = $4 WHERE id = $5 RETURNING *',
      [updatedName, updatedDescription, updatedPrice, updatedStock, id]
    );

    res.status(200).json({
      message: 'Product updated successfully.',
      product: result.rows[0]
    });
  } catch (err) {
    next(err);
  }
};

// Delete a product (Authenticated only)
exports.deleteProduct = async (req, res, next) => {
  const { id } = req.params;

  try {
    // Check if product exists
    const checkResult = await db.query('SELECT id FROM products WHERE id = $1', [id]);
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found.' });
    }

    await db.query('DELETE FROM products WHERE id = $1', [id]);

    res.status(200).json({ message: 'Product deleted successfully.' });
  } catch (err) {
    next(err);
  }
};
