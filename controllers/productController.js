const Product = require('../models/product');
const cloudinary = require('cloudinary');
const CustomError = require('../utils/customError');
const WhereClause = require('../utils/whereClause');

exports.addProduct = async (req, res, next) => {
  try {
    let imageArray = [];

    if (!req.files) {
      return next(new CustomError('images are required', 401));
    }

    // if it is an array do this
    if (Array.isArray(req.files.photos)) {
      for (let index = 0; index < req.files.photos.length; index++) {
        let result = await cloudinary.v2.uploader.upload(
          req.files.photos[index].tempFilePath,
          {
            folder: 'products',
          }
        );

        imageArray.push({
          id: result.public_id,
          secure_url: result.secure_url,
        });
      }
    } else {
      // Single file uploaded
      const uploadedPhoto = req.files.photos;

      // Upload the photo to Cloudinary
      const result = await cloudinary.v2.uploader.upload(
        uploadedPhoto.tempFilePath,
        {
          folder: 'products',
        }
      );

      imageArray.push({
        id: result.public_id,
        secure_url: result.secure_url,
      });
    }

    req.body.photos = imageArray;
    req.body.user = req.user.id;

    const product = await Product.create(req.body);

    res.status(200).json({
      succes: true,
      product,
    });
  } catch (error) {
    console.log(error);
  }
};

exports.getProducts = async (req, res, next) => {
  try {
    const resultPerPage = 5;
    const totalProducts = await Product.countDocuments(); //kind like the .length method

    const productsObj = new WhereClause(Product.find(), req.query)
      .search()
      .filter();

    let products = await productsObj.base;

    const filteredProductNumber = productsObj.length;

    // products.limit().skip() the 2 lines below are = to this
    productsObj.pagination(resultPerPage);
    products = await productsObj.base.clone();

    res.status(200).json({
      succes: true,
      products,
      filteredProductNumber,
      totalProducts,
    });
  } catch (error) {
    console.log(error);
  }
};

exports.getOneProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return next(new CustomError('No product found with that Id', 401));
    }

    res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    console.log(error);
  }
};

exports.addReview = async (req, res, next) => {
  // in the model under reviews field I have user wich connects the user to the product collection in the db
  try {
    const {productId, rating, comment} = req.body; // comes from frontend

    const review = {
      // gets info from the logged user req.user._id
      user: req.user._id,
      name: req.user.name,
      rating: Number(rating),
      comment
    }

    const product = await Product.findById(productId);

    // checks if user already has made a review
    /* the rev.user is a bson object you have to convert to string
     user: { type: mongoose.Schema.ObjectId, ref: 'User', required: true} */
    const alreadyReviewd = product.reviews.find(
      (rev) => rev.user.toString() === req.user._id.toString())

    if(alreadyReviewd){
      // update existing review, gets review then add or change comment and rating.
      product.reviews.forEach((review) => {
        if(review.user.toString() === req.user._id.toString()){
          review.comment = comment
          review.rating = rating
        }
      })
    }else{
      product.reviews.push(review)
      // updates numberOfReview from DB/Model
      product.numberOfReviews = product.numberOfReviews.length
    }

    // adjust ratings
    product.ratings = product.reviews.reduce(
      (acc, item) => item.rating + acc, 0) / product.reviews.length


    await product.save({validateBeforeSave: false}) 
      
    res.status(200).json({
      success: true,
      product
    });
  } catch (error) {
    console.log(error);
  }
};

exports.deleteReview = async (req, res, next) => {
  // in the model under reviews field I have user wich connects the user to the product collection in the db
  try {
    // recieves the product that will be deleted from frontend
    const { productId } = req.query;

    // gets product from db
    const product = await Product.findById(productId);

    /* filter the reviews array to exclude the one we want to delete. 
      filter excludes the match(es) and returns new array with the rest */
    const reviews = product.reviews.filter(rev => rev.user.toString() === req.user._id.toString());

    // gets numberOfReviews that will be recalculated
    const numberOfReviews = reviews.length;

    /* recalculate ratings. 0 is the initial value option divided by the reviews.length 
      will get you the average rating */
    product.ratings = product.reviews.reduce(
      (acc, item) => item.rating + acc, 0) / product.reviews.length;

    await Product.findByIdAndUpdate(productId, {
      reviews,
      ratings,
      numberOfReviews
    }, {
      new: true, 
      runValidators: true
    })

  } catch (error) {
    console.log(error);
  }
};

// if you need to get the just the brand this would be similar
exports.getOnlyReviewsForOneProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.query.id);

    // returns reviews for that specific product
    res.status(200).json({
      success: true,
      reviews: product.reviews
    })
  } catch (error) {
    console.log(error)
  }
}


// admin
exports.adminGetAllProducts = async (req, res, next) => {
  try {
    const products = await Product.find();

    res.status(200).json({
      success: true,
      products,
    });
  } catch (error) {}
};

exports.adminUpdateOneProduct = async (req, res, next) => {
  try {
    let product = await Product.findById(req.params.id);

    if (!product) {
      return next(new CustomError('No product found with that Id', 401));
    }

    let imagesArray = [];

    // this updates will delete current photos and upload new ones
    if(req.files){
      // delete current photos
      for (let index = 0; index < product.photos.length; index++) {
        await cloudinary.v2.uploader.destroy(
          product.photos[index].id
        );
      }

      // if uploading only one file
      if(!Array.isArray(req.files.photos)){
        let result = await cloudinary.v2.uploader.upload(req.files.photos.tempFilePath, {
          folder: "products"
        })

        imagesArray.push({
          id: result.public_id,
          secure_url: result.secure_url,
        })  
      }

      // if uploading more than 1 file
      for (let index = 0; index < req.files.photos.length; index++) {
          let result = await cloudinary.v2.uploader.upload(req.files.photos[index].tempFilePath, {
            folder: "products"
          })

          imagesArray.push({
            id: result.public_id,
            secure_url: result.secure_url,
          })  
      }

    }

    req.body.photos = imagesArray;

    // update db
    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      product
    })

  } catch (error) {
    console.log(error)
  }
};

exports.admingDeleteOneProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return next(new CustomError('No product found with that Id', 401));
    }

    // delete current photos
    for (let index = 0; index < product.photos.length; index++) {
     const result =  await cloudinary.v2.uploader.destroy(product.photos[index].id);
    }

    const deleted = await product.deleteOne();

    res.status(200).json({
      success: true,
      deleted,
    });
  } catch (error) {
    console.log(error);
  }
};
