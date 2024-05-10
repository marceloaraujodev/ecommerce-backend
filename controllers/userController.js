const User = require('../models/userModel'); 
const CustomError = require('../utils/customError');
const cookieToken = require('../utils/cookieToken');
const cloudinary = require('cloudinary');
const emailSend = require('../utils/emailSend');
const crypto = require('crypto');

exports.signup = async (req, res, next) => {
  try {
    // let result; // so I can use the result of the cloudinary op
    let photoData = {};

    const {name, email, password} = req.body;

    if(!email || !password || !name){
      return next(new CustomError('Please provide email, name, password', 400))
    }

    if(!req.files) photoData = {}

    // let photo be optional, i think is better
    if(req.files){
      let file = req.files.photo // frontend needs to call photo

      // upload to cloudinary
      const result = await cloudinary.v2.uploader.upload(file.tempFilePath, {
        folder: 'users',
        width: 150,
        crop: "scale" // fit, stretch
      });

      photoData = {
        id: result.public_id,
        secure_url: result.secure_url,
      }

    }

    // create user and send to db
    const user = await User.create({
      name, 
      email, 
      password,
      photo: photoData
    })

    // create token from instace method from userModel
    cookieToken(user, res); // from utils cookieToken


  } catch (error) {
    console.log(error)
    res.status(400).json({error})
  }
};

exports.login = async(req, res, next) => {
  try {
    const {email, password} = req.body;
    // console.log(email, password)

    // check if both fields are present
    if(!email || !password){
      return next(new CustomError('No email or password provided.', 400));
    }

    // find user on db and return the password that is hashed
    const user = await User.findOne({email}).select("+password");

    if(!user){
      return next(new CustomError('Email or Password Invalid', 400));
    }
    // compare the password using the isPass.. method from the model
    const passValidated = await user.isPasswordValidated(password);
    if(!passValidated){
      return next(new CustomError('Password or Email Invalid', 400))
    }

    // pass token to logged user
    cookieToken(user, res);
  } catch (error) {
    console.log(error);
  }

}

exports.logout = async(req, res, next) => {
  try {
    res.cookie('token', null, {
      expires: new Date(Date.now()), // Sets the 'token' cookie to null and expires it by setting the expiration date to the current time
      httpOnly: true
    });
    res.status(200).json({
      success: true,
      message: 'Logout Successfully'
    })
  } catch (error) {
    console.log(error);
  }
 
}

// sends email with token 
exports.forgotPassword = async(req, res, next) => {
  try {
    const {email} = req.body;
    console.log(email)

    const user = await User.findOne({email});
    
    if(!user){
      return next(new CustomError('No email found', 500));
    }
    
    const forgotToken = user.getForgotPasswordToken(); // ignore warning on .get... its tripping
    
    /* saves without the validation like required fields 
    Here's how it works:

      First, it retrieves the user based on the provided email using User.findOne({email}).
      If a user with the provided email is found, it generates a forgot password token using const forgotToken = user.getForgotPasswordToken();.
      Then it temporarily disables Mongoose's validation by passing {validateBeforeSave: false} to user.save() because the schema might have required fields that are not yet filled (like forgotPasswordToken and forgotPasswordExpires).
      The user document is then saved, and this includes the forgotPasswordToken and forgotPasswordExpires fields that were set in the getForgotPasswordToken() method.
      Afterwards, the email containing the reset password link is sent to the user.
      So, the line await user.save({validateBeforeSave: false}); is where the this.forgotPasswordToken field is being saved to the database.

      In the resetPassword function, you're just hashing the token to compare it with the hashed token stored in the database. This function doesn't involve saving any changes to the database. It's for the purpose of verifying the reset password token provided in the URL with the token stored in the database.
    */
    await user.save({validateBeforeSave: false}) 
    console.log(user)
    
    const myUrl = `${req.protocol}://${req.get("host")}/password/reset/${forgotToken}`;

    const message = `Copy paste the link in your browser and enter \n\n ${myUrl}`;
    console.log(message)

    try {
      console.log('enter')
      await emailSend({
        email: user.email,
        subject: "Reseting your password",
        message
      })
      console.log('await emailsend after')
      res.status(200).json({
        success: true,
        message: 'Email sent successfully'
      })
    } catch (error) {
      /* this is done because we have those fields on the model but
       they are empty, when we hit this route we create them, if there is an error we have to reset them to empty! */
      user.forgotPasswordExpires = undefined
      user.forgotPasswordToken = undefined
      await user.save({validateBeforeSave: false}) 
      return next( new CustomError(error.message), 500)
    }

  } catch (error) {
    console.log(error)
  }
 
}

exports.resetPassword = async (req, res, next) => {

  try {
    const token = req.params.token;
    
    /* here we encrypt the token to compare to the one in the db 
    that is created when we run the getForgotPasswordToken. We can also search for this field since it is unique */
    const encryptToken = crypto.createHash('sha256').update(token).digest('hex');
  
    const user = await User.findOne({
      forgotPasswordToken: encryptToken, 
      forgotPasswordExpires: {$gt: Date.now()}
    })
  
    console.log(user)
  
    if(!user){
      return next(new CustomError('Token is invalid or expired', 400))
    };
  
      if(req.body.password !== req.body.confirmPassword){
        return next(new CustomError('Password and confirm password do not match', 400))
      };
  
    // sets the new password 
    user.password = req.body.password;
    
    // both of these fields had data on it and need to be cleared.
    user.forgotPasswordToken = undefined; 
    user.forgotPasswordExpires = undefined;
    
    // saves to db
    await user.save();
  
    // sends resonse to user
    cookieToken(user, res)
    
  } catch (error) {
    console.log(error)
  }

}

// only accessed if looged in. goes to user profile info
exports.getLoggedUserProfile = async (req, res, next) => {

  try {
    // req.user was injected @ user middleware folder
    const user = await User.findById(req.user);
  
    res.status(200).json({
      success: true,
      user,
    })
    
  } catch (error) {
    console.log(error)
  }


}
// only accessed if looged in
exports.changePassword = async (req, res, next) => {
  try {
    // isLoggedIn injects req.user on the user obj
    const userId = req.user.id;
  
    const user = await User.findById(userId).select('+password');
    // console.log(user)
  
    const isOldPassCorrect = await user.isPasswordValidated(req.body.oldPassword)
    // console.log(isOldPassCorrect)
  
    // if false
    if(!isOldPassCorrect){
      return next(new CustomError('Old password is incorrect', 400))
    }
  
    // sets the password to the one coming from the frontend in the req objc
    user.password = req.body.newPassword;
  
    await user.save();
  
    // sets a cookie to have the token
    cookieToken(user, res);
    
  } catch (error) {
    console.log(error)
  }
}

// only accessed if logged in (middleware lets us get user anywhere)
exports.updateUserDetails = async (req, res, next) => {
  try {
    
      if(!req.body.name || !req.body.email){
        console.log('enter')
        return next(new CustomError('Email and name should be provided', 401));
      }
    
      /* user will send data, (frontend should load the original data required from db 
        for the users fields, ex: name, email, photo...)  if they updated or not we will recieve it and here we can reset it, 
      
        we have a issue since the photos is hosted on cloudinary we dont have it comming in with the fields, we only would have a new photo in this case  */
      const newData = {
        name: req.body.name,
        email: req.body.email
      };
    
      /* if we recieve a new photo to be updated. 
        photo has id inside db photo: {id: { type: String }} 
        // 1 go to cloudinary delete photo. 
        // 2 upload new photo to cloudninary */
      if(req.files !== '' && req.files !== null){
        let file = req.files.photo
    
        const user = await User.findById(req.user.id);
    
        // Get photo id to access correct photo on cloudinary
        const imgId = user.photo.id;
    
        // Delete photo on cloudinary
        await cloudinary.v2.uploader.destroy(imgId);
    
        // upload the newly recieved photo
        const result = await cloudinary.v2.uploader.upload(file.tempFilePath, {
          folder: 'users',
          width: 150,
          crop: "scale" 
        });
    
        // creates the photo field on the newData object, with the result details from cloudinary result variable
        newData.photo = {
          id: result.public_id,
          secure_url: result.secure_url,
        }
      };
    
      /* get user and update new data fields (comes from the frontend), 
        limited validation 
        the new flag returns the new modified document instead of the original
        */
      const user = await User.findByIdAndUpdate(req.user.id, newData, {
        new: true,
        runValidators: true,
      })
    
      res.json({
        success: true,
        user
      })
      // for full validation run findbyid() then .save()
    
  } catch (error) {
    console.log(error)
  }
}

// Admin role
exports.adminAllUsers = async (req, res, next) => {
  try {
    const users = await User.find();
  
    console.log(users)
  
    res.status(200).json({
      success: true,
      users
    })
    
  } catch (error) {
    console.log(error)
  }
}

exports.adminGetOneUser = async (req, res, next) => {
  try {
    // req.params is a object I need the value
    const id = req.params.id;
    const user = await User.findById(id);
    console.log(user)
  
    // if no user will still give frontend a response with a empty user, if
      // I return it stops here and no response is given to the client
    if(!user){
      next(new CustomError('No user found or wrong Id'), 400)
    }
  
    res.status(200).json({
      success: true,
      user
    })
    
  } catch (error) {
    console.log(error)
  }
}

exports.adminUpdateOneUser = async (req, res, next) => {
  try {
    
    if(!req.body.name || !req.body.email){
      console.log('enter')
      return next(new CustomError('Email and name should be provided', 401));
    }
  
    const newData = {
      name: req.body.name,
      email: req.body.email,
      role: req.body.role
    };
  
    if(req.files !== '' && req.files !== null){
      let file = req.files.photo
  
      const user = await User.findById(req.user.id);
  
  
      const imgId = user.photo.id;
  
  
      await cloudinary.v2.uploader.destroy(imgId);
  
  
      const result = await cloudinary.v2.uploader.upload(file.tempFilePath, {
        folder: 'users',
        width: 150,
        crop: "scale" 
      });
  
      // creates the photo field on the newData object, with the result details from cloudinary result variable
      newData.photo = {
        id: result.public_id,
        secure_url: result.secure_url,
      }
    };
  
    const user = await User.findByIdAndUpdate(req.params.id, newData, {
      new: true,
      runValidators: true,
    })
  
    res.json({
      success: true,
      user
    })
  } catch (error) {
    console.log(error)
  }

}
// delete user and user photo
exports.adminDeleteOneUser = async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if(!user){
    return next(new CustomError('No user found', 401));
  }

  // delete photo first since it holds reference to the photo in the photo.id model

  // get thes photo id
  const imageId = user.photo.id;

  await cloudinary.v2.uploader.destroy(imageId);

  user.remove(); 

  res.status(200).json({
    success: true
  })

}



// Manager role. gets all users emails 
exports.managerAllUsers = async (req, res, next) => {
  try {
    const users = await User.find({}, 'email');
  
    res.status(200).json({
      success: true,
      users
    })
    
  } catch (error) {
    
  }
}