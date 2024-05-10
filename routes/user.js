const express = require('express');
const router = express.Router();
const {
  signup,
  login,
  logout,
  forgotPassword,
  resetPassword,
  getLoggedUserProfile,
  changePassword,
  updateUserDetails,
  adminAllUsers,
  managerAllUsers,
  adminGetOneUser, 
  adminUpdateOneUser,
  adminDeleteOneUser,
} = require('../controllers/userController');
const { isLoggedIn, customRole } = require('../middleware/user');


router.route('/logout').get(logout);

router.route('/signup').post(signup);
router.route('/login').post(login);
router.route('/forgotPassword').post(forgotPassword);
router.route('/password/reset/:token').post(resetPassword);

router.route('/userprofile').get(isLoggedIn, getLoggedUserProfile);
router.route('/password/update').post(isLoggedIn, changePassword);
router.route('/userprofile/update').post(isLoggedIn, updateUserDetails);

// Admin
router.route('/admin/users').get(isLoggedIn, customRole('admin'), adminAllUsers);
router.route('/admin/user/:id')
.get(isLoggedIn, customRole('admin'), adminGetOneUser)
.put(isLoggedIn, customRole('admin'), adminUpdateOneUser)
.delete(isLoggedIn, customRole('admin'), adminDeleteOneUser)

// gets all users emails
router.route('/manager/users').get(isLoggedIn, customRole('manager'), managerAllUsers);



module.exports = router;
