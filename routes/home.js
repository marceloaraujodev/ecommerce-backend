// ## Handles all routes from '/'
const express = require('express');
const router = express.Router();

const { home, dummy } = require('../controllers/homeController');

router.route('/').get(home);

// for testing
router.route('/dummy').get(dummy);

module.exports = router;
