const pool = require('../config/db');

// GET all addresses
const getAllAddresses = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT addr.*, a.name AS client_name, a.email AS client_email
      FROM addresses addr
      JOIN clients a ON addr.customer_number = a.customer_number
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET address by ID
const getAddressById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(`
      SELECT addr.*, a.name AS client_name, a.email AS client_email
      FROM addresses addr
      JOIN clients a ON addr.customer_number = a.customer_number
      WHERE addr.id = $1
    `, [id]);

    if (result.rows.length === 0)
      return res.status(404).json({ error: 'Address not found' });

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET all addresses for a specific client
const getAddressesByCustomer = async (req, res) => {
  try {
    const { customer_number } = req.params;
    const result = await pool.query(
      'SELECT * FROM addresses WHERE customer_number = $1',
      [customer_number]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST create address
const createAddress = async (req, res) => {
  try {
    const { customer_number, street, city, state, zip_code, country } = req.body;

    if (!customer_number || !street || !city || !state || !zip_code || !country)
      return res.status(400).json({ error: 'All fields are required' });

    const result = await pool.query(
      `INSERT INTO addresses (customer_number, street, city, state, zip_code, country)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [customer_number, street, city, state, zip_code, country]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23503')
      return res.status(400).json({ error: 'customer_number does not exist' });
    res.status(500).json({ error: err.message });
  }
};

// PUT update address
const updateAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const { street, city, state, zip_code, country } = req.body;

    const result = await pool.query(
      `UPDATE addresses
       SET street   = COALESCE($1, street),
           city     = COALESCE($2, city),
           state    = COALESCE($3, state),
           zip_code = COALESCE($4, zip_code),
           country  = COALESCE($5, country)
       WHERE id = $6
       RETURNING *`,
      [street, city, state, zip_code, country, id]
    );

    if (result.rows.length === 0)
      return res.status(404).json({ error: 'Address not found' });

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE address
const deleteAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'DELETE FROM addresses WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0)
      return res.status(404).json({ error: 'Address not found' });

    res.json({ message: 'Address deleted', address: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getAllAddresses, getAddressById, getAddressesByCustomer,
  createAddress, updateAddress, deleteAddress
};