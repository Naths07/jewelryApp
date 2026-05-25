const express = require('express');
const router  = express.Router();
const {
  getAllAddresses, getAddressById, getAddressesByCustomer,
  createAddress, updateAddress, deleteAddress
} = require('../controllers/addressesController');

router.get('/',                            getAllAddresses);
router.get('/customer/:customer_number',   getAddressesByCustomer); // ← must be BEFORE /:id
router.get('/:id',                         getAddressById);
router.post('/',                           createAddress);
router.put('/:id',                         updateAddress);
router.delete('/:id',                      deleteAddress);

module.exports = router;