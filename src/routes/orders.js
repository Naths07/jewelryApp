const express = require('express');
const router  = express.Router();
const {
  getAllOrders, getOrderById, getOrdersByCustomer,
  createOrder, updateOrder, deleteOrder
} = require('../controllers/ordersController');

router.get('/',                           getAllOrders);
router.get('/customer/:customer_number',  getOrdersByCustomer); // ← must be BEFORE /:order_id
router.get('/:order_id',                  getOrderById);
router.post('/',                          createOrder);
router.put('/:order_id',                  updateOrder);
router.delete('/:order_id',               deleteOrder);

module.exports = router;