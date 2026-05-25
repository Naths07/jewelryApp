const express = require('express');
const router  = express.Router();
const {
  getAllClients, getClientById,
  createClient, updateClient, deleteClient
} = require('../controllers/clientsController');

router.get('/',                  getAllClients);
router.get('/:customer_number',  getClientById);
router.post('/',                 createClient);
router.put('/:customer_number',  updateClient);
router.delete('/:customer_number', deleteClient);

module.exports = router;