const pool = require('../config/db');

// GET all clients (with their address joined)
const getAllClients = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT a.*, 
             addr.street, addr.city, addr.state, addr.zip_code, addr.country
      FROM clients a
      LEFT JOIN addresses addr ON a.customer_number = addr.customer_number
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET one client by customer_number
const getClientById = async (req, res) => {
  try {
    const { customer_number } = req.params;
    const result = await pool.query(`
      SELECT a.*, 
             addr.street, addr.city, addr.state, addr.zip_code, addr.country
      FROM clients a
      LEFT JOIN addresses addr ON a.customer_number = addr.customer_number
      WHERE a.customer_number = $1
    `, [customer_number]);

    if (result.rows.length === 0)
      return res.status(404).json({ error: 'Client not found' });

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST create client
const createClient = async (req, res) => {
  try {
    const { name, email, phone_number } = req.body;

    if (!name || !email || !phone_number)
      return res.status(400).json({ error: 'name, email, and phone_number are required' });

    const result = await pool.query(
      'INSERT INTO clients (name, email, phone_number) VALUES ($1, $2, $3) RETURNING *',
      [name, email, phone_number]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505')
      return res.status(409).json({ error: 'Email already exists' });
    res.status(500).json({ error: err.message });
  }
};

// PUT update client
const updateClient = async (req, res) => {
  try {
    const { customer_number } = req.params;
    const { name, email, phone_number } = req.body;

    const result = await pool.query(
      `UPDATE clients
       SET name         = COALESCE($1, name),
           email        = COALESCE($2, email),
           phone_number = COALESCE($3, phone_number)
       WHERE customer_number = $4
       RETURNING *`,
      [name, email, phone_number, customer_number]
    );

    if (result.rows.length === 0)
      return res.status(404).json({ error: 'Client not found' });

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE client
const deleteClient = async (req, res) => {
  try {
    const { customer_number } = req.params;
    const result = await pool.query(
      'DELETE FROM clients WHERE customer_number = $1 RETURNING *',
      [customer_number]
    );

    if (result.rows.length === 0)
      return res.status(404).json({ error: 'Client not found' });

    res.json({ message: 'Client deleted', client: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getAllClients, getClientById, createClient, updateClient, deleteClient };