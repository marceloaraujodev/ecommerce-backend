const mongoose = require('mongoose');


const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'please provide a product name'],
    trim: true,
    maxlength: [120, 'Product name should not be more then 120 characters']
  },
  price: {
    type: Number,
    required: [true, 'please provide a product price'],
    maxlength: [6, 'Product price should not be more then 6 digits']
  },
  description: {
    type: String,
    required: [true, 'please provide a product description'],
  },
  photos: [
    {
      id: {
        type: String,
        required: true
      },
      secure_url: {
        type: String,
        require: true
      }
    }
  ],
  category: {
    type: String,
    required: [true, 'please select select a product category - long-sleeves, short-sleeves, hoodies'],
    enum: {
      values: ['shortsleeves', 'longsleeves', 'hoodies'],
      message: 'please select select a product category - long-sleeves, short-sleeves, hoodies'
    }
  },
  brand: {
    type: String,
    required: [true, 'please provide a product brand'],
  },
  ratings: {
    type: Number,
    default: 0
  },
  numberOfReviews: {
    type: Number,
    default: 0
  },
  reviews: [
    {
      user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
      },
      name: {
        type: String,
        required: true
      },
      rating: {
        type: Number,
        required: true
      },
      comment: {
        type: String,
        required: true
      }
    }
  ],
  user: {
    // can show you wich user added the product
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  stock: {
    type: Number,
    required: [true, 'Please add a stock value']
  }
  

})

module.exports = mongoose.model('Product', productSchema);