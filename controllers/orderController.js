const order = require('../models/order');
const Order = require('../models/order');
const Product = require('../models/product');
const CustomError = require('../utils/customError');

exports.createOrder = async (req, res, next) => {
  try {
    const {
      shippingInfo,
      orderItems,
      paymentInfo,
      taxAmount,
      shippingAmount,
      totalAmount,
    } = req.body;

    const order = await Order.create({
      shippingInfo,
      orderItems,
      paymentInfo,
      taxAmount,
      shippingAmount,
      totalAmount,
      user: req.user._id
    });

    res.status(200).json({
      success: true,
      order
    })

  } catch (error) {
    console.log(error)
  }
}

exports.getOneOrder = async (req, res, next) => {
  try {
    // notice on the populate the syntax is just a space no comma! ⚠️
    const order = await Order.findById(req.params.id).populate('user', 'name email role createdAt')

    if(!order){
      return next(new CustomError('No order found, check order Id', 401));
    }
    res.status(200).json({
      success: true,
      order
    })
  } catch (error) {
    console.log(error)
  }
}

// gets order for logged users
exports.getLoggedInOrders = async (req, res, next) => {
    // console.log(req.user._id) // new ObjectId('661d35e0d9323c5aecd12098')
  try {
    // find out logged user
    // the user, req.user is injected in the middleware
    const order = await Order.find({user: req.user._id});

    if(!order){
      return next(new CustomError('No order found, check order Id', 401));
    }

    res.status(200).json({
      success: true,
      order
    })

  } catch (error) {
    console.log(error)
  }
}

exports.adminGetAllOrders = async (req, res, next) => {
  try {
    const orders = await Order.find();

    res.status(200).json({
      success: true,
      orders
    })

  } catch (error) {
    console.log(error)
  }
}

exports.adminUpdateOrder = async (req, res, next) => {
  try {
    // the order comes in the url, you get it and you search for it
    const order = await Order.findById(req.params._id);

    if(order.orderStatus === 'delivered'){
      return next(new CustomError('order has already been delivered', 401));
    }


    order.orderStatus = req.body.orderStatus;

    order.orderItems.forEach(async (product) => {
      updateStock(product._id, product.quantity)
    })

    await order.save();

    res.status(200).json({
      success: true,
      order
    })

  } catch (error) {
    console.log(error)
  }
}

exports.adminDeleteOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    await order.remove();

    res.status(200).json({
      success: true,
      order
    })

  } catch (error) {
    console.log(error)
  }
}

async function updateStock (productId, quantity) {
  // find product then get the stock
  const product = await Product.findById(productId);

  product.stock = product.stock - quantity;

  await product.save({validateBeforeSave: false});
}

