const path = require('path');
const express = require('express');
const { body } = require('express-validator');

const adminController = require('../controllers/admin');

const isAuth = require('../middleware/is-auth');

const router = express.Router();

// /admin/add-product => GET
router.get('/add-product', isAuth, adminController.getAddProduct);

router.get('/products', adminController.getProducts);

// /admin/add-product => POST
router.post(
  '/add-product',
  [
    body('title')
      .isAlphanumeric()
      .isLength({ min: 3 })
      .trim(),
    body('price').isFloat(),
    body('description')
      .isLength({ min: 3, max: 200 })
      .trim()
  ],
  isAuth,
  adminController.postAddProduct
);

router.get('/edit-product/:productId', isAuth, adminController.getEditProduct);

router.post(
  '/edit-product/',
  [
    body('title')
      .isAlphanumeric()
      .isLength({ min: 3 })
      .trim(),
    body('price').isFloat(),
    body('description')
      .isLength({ min: 3, max: 200 })
      .trim()
  ],
  isAuth,
  adminController.postEditProduct
);

router.post('/delete-product/', isAuth, adminController.postDeleteProduct);

router.delete('/product/:productId', isAuth, adminController.deleteProduct);

module.exports = router;
