const pool = require('../config/db');

const VALID_TYPES = ['bracelet', 'necklace', 'ring'];

// GET all products (optional ?type= filter)
const getAllProducts = async (req, res) => {
  try {
    const { type } = req.query;
    let query  = 'SELECT * FROM products';
    let params = [];

    if (type) {
      if (!VALID_TYPES.includes(type))
        return res.status(400).json({ error: `type must be one of: ${VALID_TYPES.join(', ')}` });
      query += ' WHERE type = $1';
      params.push(type);
    }

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET product by product_no
const getProductById = async (req, res) => {
  try {
    const { product_no } = req.params;
    const result = await pool.query(
      'SELECT * FROM products WHERE product_no = $1',
      [product_no]
    );

    if (result.rows.length === 0)
      return res.status(404).json({ error: 'Product not found' });

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST create product
const createProduct = async (req, res) => {
  try {
    const { name, type } = req.body;

    if (!name || !type)
      return res.status(400).json({ error: 'name and type are required' });

    if (!VALID_TYPES.includes(type))
      return res.status(400).json({ error: `type must be one of: ${VALID_TYPES.join(', ')}` });

    const result = await pool.query(
      'INSERT INTO products (name, type) VALUES ($1, $2) RETURNING *',
      [name, type]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PUT update product
const updateProduct = async (req, res) => {
  try {
    const { product_no } = req.params;
    const { name, type } = req.body;

    if (type && !VALID_TYPES.includes(type))
      return res.status(400).json({ error: `type must be one of: ${VALID_TYPES.join(', ')}` });

    const result = await pool.query(
      `UPDATE products
       SET name = COALESCE($1, name),
           type = COALESCE($2, type)
       WHERE product_no = $3
       RETURNING *`,
      [name, type, product_no]
    );

    if (result.rows.length === 0)
      return res.status(404).json({ error: 'Product not found' });

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE product
const deleteProduct = async (req, res) => {
  try {
    const { product_no } = req.params;
    const result = await pool.query(
      'DELETE FROM products WHERE product_no = $1 RETURNING *',
      [product_no]
    );

    if (result.rows.length === 0)
      return res.status(404).json({ error: 'Product not found' });

    res.json({ message: 'Product deleted', product: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getAllProducts, getProductById, createProduct, updateProduct, deleteProduct };