const pool = require('../config/db');

const VALID_STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

// GET all orders (with client + product info joined)
const getAllOrders = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT o.*,
             a.name  AS client_name,
             a.email AS client_email,
             p.name  AS product_name,
             p.type  AS product_type
      FROM orders o
      JOIN clients   a ON o.customer_number = a.customer_number
      JOIN products p ON o.product_no      = p.product_no
      ORDER BY o.order_date DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET one order by order_id
const getOrderById = async (req, res) => {
  try {
    const { order_id } = req.params;
    const result = await pool.query(`
      SELECT o.*,
             a.name  AS client_name,
             a.email AS client_email,
             p.name  AS product_name,
             p.type  AS product_type
      FROM orders o
      JOIN clients   a ON o.customer_number = a.customer_number
      JOIN products p ON o.product_no      = p.product_no
      WHERE o.order_id = $1
    `, [order_id]);

    if (result.rows.length === 0)
      return res.status(404).json({ error: 'Order not found' });

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET orders by customer_number
const getOrdersByCustomer = async (req, res) => {
  try {
    const { customer_number } = req.params;
    const result = await pool.query(`
      SELECT o.*,
             p.name AS product_name,
             p.type AS product_type
      FROM orders o
      JOIN products p ON o.product_no = p.product_no
      WHERE o.customer_number = $1
      ORDER BY o.order_date DESC
    `, [customer_number]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST create order
const createOrder = async (req, res) => {
  try {
    const { customer_number, product_no, quantity, status } = req.body;

    if (!customer_number || !product_no)
      return res.status(400).json({ error: 'customer_number and product_no are required' });

    if (status && !VALID_STATUSES.includes(status))
      return res.status(400).json({ error: `status must be one of: ${VALID_STATUSES.join(', ')}` });

    const result = await pool.query(
      `INSERT INTO orders (customer_number, product_no, quantity, status)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [customer_number, product_no, quantity || 1, status || 'pending']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23503')
      return res.status(400).json({ error: 'Invalid customer_number or product_no' });
    res.status(500).json({ error: err.message });
  }
};

// PUT update order
const updateOrder = async (req, res) => {
  try {
    const { order_id } = req.params;
    const { quantity, status } = req.body;

    if (status && !VALID_STATUSES.includes(status))
      return res.status(400).json({ error: `status must be one of: ${VALID_STATUSES.join(', ')}` });

    const result = await pool.query(
      `UPDATE orders
       SET quantity = COALESCE($1, quantity),
           status   = COALESCE($2, status)
       WHERE order_id = $3
       RETURNING *`,
      [quantity, status, order_id]
    );

    if (result.rows.length === 0)
      return res.status(404).json({ error: 'Order not found' });

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE order
const deleteOrder = async (req, res) => {
  try {
    const { order_id } = req.params;
    const result = await pool.query(
      'DELETE FROM orders WHERE order_id = $1 RETURNING *',
      [order_id]
    );

    if (result.rows.length === 0)
      return res.status(404).json({ error: 'Order not found' });

    res.json({ message: 'Order deleted', order: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getAllOrders, getOrderById, getOrdersByCustomer,
  createOrder, updateOrder, deleteOrder
};