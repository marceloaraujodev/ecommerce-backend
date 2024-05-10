const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  shippingInfo: {
    address: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      required: true,
    },
    zipCode: {
      type: Number,
      required: true,
    },
    country: {
      type: String,
      required: true,
    },
    phone: {
      type: Number,
    },
  },
  user: {
    type: mongoose.Schema.ObjectId, // mongoose.types.ObjectId is the samething
    ref: 'User',
    required: true
  },
  orderItems: [
    {
      name: {
        type: String,
        required: true
      },
      quantity: {
        type: Number,
        required: true
      },
      image: {
        type: String,
      },
      price: {
        type: Number,
        required: true
      },
      product: {
        type: mongoose.Schema.ObjectId, // mongoose.types.ObjectId is the samething
        ref: 'Product',
        required: true
      },
    },
  ],
  paymentInfo: {
    id: {
      type: String
    }
  },
  taxAmount: {
    type: Number, // optional because if tax is already in the product price
  },
  shippingAmount: {
    type: Number,
    required: true
  },
  totalAmount: {
    type: Number,
    required: true
  },
  orderStatus: {
    type: String,
    required: true,
    default: 'processing'
  },
  deliveredAt: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now // Date.now is a reference and the function will be called when new document is created. while Date.now() is the result of calling the function!
  },
});

module.exports = mongoose.model('Order', orderSchema);
