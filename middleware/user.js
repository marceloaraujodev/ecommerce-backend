const User = require('../models/userModel');
const CustomError = require('../utils/customError');
const jwt = require('jsonwebtoken');

/* this middleware gives us access to the user whenever user is logged in
  1 gets the token from the login
  2 injects the user property into the req object
*/
exports.isLoggedIn = async (req, res, next) => {

  if(!req.cookies.token && !req.headers.authorization){
    return next(new CustomError('You dont have permission', 401));
  }
  
  const token = req.cookies.token || req.header('Authorization').replace('Bearer ', '');

  if(!token){
    return next(new CustomError('Please Login', 401))
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  // sets id to the req.user object
 req.user = await User.findById(decoded.id);

  next();
}

exports.customRole = (...roles) => {
  return (req, res, next) => {
    if(!roles.includes(req.user.role)){
      return next(new CustomError('You dont have the credentials for this route', 403))
    }
    next();
  }
}