const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
  },
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    // validator: [validator.isEmail, 'Email format is incorrect'],
    unique: true
  },
  password: {
    type: String,
    required: [true, 'Please provide password'],
    minlength: [3, 'password should be at least 6 character'],
    select: false
  },
  role: {
    type: String,
    default: 'user'
  },
  photo: {
    id: {
      type: String,
      // required: true
    },
    secure_url: {
      type: String,
      // required: true
    }
  },
  forgotPasswordToken: String,
  forgotPasswordExpires: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// encrypting pass before saving to db
userSchema.pre('save', async function(next) {
  // go to the next step if password is not modified
  if(!this.isModified('password')) return next()

  // encrypt pass for the first time or if is being modified
  this.password = await bcrypt.hash(this.password, 10)
});

// validate user pass | methods
userSchema.methods.isPasswordValidated = async function (userPassword){
  return await bcrypt.compare(userPassword, this.password)
}

// usually insert id on token |methods
userSchema.methods.getJwtToken = function (){
  // id from mongo db
  return jwt.sign({id: this._id}, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES
  })
}

/* forgot password | Method. returns encrypted forgotToken, and
   saves the a encrypted token to the db to be compared with the one we send on the email in the forgotPassword method in the user controller. */
userSchema.methods.getForgotPasswordToken = function () {
  // create random string
  const forgotToken = crypto.randomBytes(20).toString('hex');
  
  this.forgotPasswordToken = crypto.createHash('sha256').update(forgotToken).digest('hex');

  // time of token 
  this.forgotPasswordExpires = Date.now() + 20 * 60 * 1000 // 20

  return forgotToken

}


module.exports = mongoose.model('User', userSchema);

