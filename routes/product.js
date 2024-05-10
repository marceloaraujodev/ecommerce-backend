const express = require('express');
const {
  addProduct, 
  getProducts, 
  adminGetAllProducts, 
  getOneProduct, 
  adminUpdateOneProduct, 
  admingDeleteOneProduct,
  addReview,
  deleteReview,
  getOnlyReviewsForOneProduct,
} = require('../controllers/productController');
const router = express.Router();

// middleware
const { isLoggedIn, customRole } = require('../middleware/user');



//user routes
router.route('/products').get(getProducts);
router.route('/product/:id').get(getOneProduct);
router.route('/review').put(isLoggedIn, addReview); // put because product already existed we just put the review in
router.route('/review').delete(isLoggedIn, deleteReview); 
router.route('/reviews').get(getOnlyReviewsForOneProduct); 


// admin 
router.route('/admin/products').get(isLoggedIn, customRole('admin'), adminGetAllProducts)
router.route('/admin/product/add').post(isLoggedIn, customRole('admin'), addProduct);
router.route('/admin/product/:id').put(isLoggedIn, customRole('admin'), adminUpdateOneProduct)
router.route('/admin/product/:id').delete(isLoggedIn, customRole('admin'), admingDeleteOneProduct);


module.exports = router;