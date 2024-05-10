const express = require('express');
const router = express.Router();
const { captureStripePayment, sendStripeKey} = require('../controllers/paymentController');

// middleware
const { isLoggedIn, customRole } = require('../middleware/user');

router.route('/stripekey').get(isLoggedIn, sendStripeKey)

router.route('/capturestripe').post(isLoggedIn, captureStripePayment)

module.exports = router;