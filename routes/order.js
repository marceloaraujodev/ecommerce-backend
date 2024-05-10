const express = require('express');
const { 
  createOrder,
   getOneOrder,
   getLoggedInOrders,
   adminGetAllOrders,
   adminDeleteOrder,
   adminUpdateOrder,
 } = require('../controllers/orderController');
const router = express.Router();

// middleware
const { isLoggedIn, customRole } = require('../middleware/user');


// order MATTERS!
router.route('/order/create').post(isLoggedIn, createOrder);
router.route('/myorder').get(isLoggedIn, getLoggedInOrders);
/* place :id routes at the very end because if I have /order/myorder above the :id
 the :id route will be activated and used as /order/myoder where myorder is assign to the :id */
router.route('/order/:id').get(isLoggedIn, getOneOrder);

// admin routes
router.route('/admin/orders').get(isLoggedIn, customRole('admin'), adminGetAllOrders);
router
  .route('/admin/order/:id')
  .put(isLoggedIn, customRole('admin'), adminUpdateOrder)
  .delete(isLoggedIn, customRole('admin'), adminDeleteOrder);

module.exports = router;