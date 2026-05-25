const express = require('express');
const router  = express.Router();
const {
  getAllProducts, getProductById,
  createProduct, updateProduct, deleteProduct
} = require('../controllers/productsController');

router.get('/',            getAllProducts);
router.get('/:product_no', getProductById);
router.post('/',           createProduct);
router.put('/:product_no', updateProduct);
router.delete('/:product_no', deleteProduct);

module.exports = router;