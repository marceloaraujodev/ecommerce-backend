const stripe = require('stripe')(process.env.STRIPE_PUBLISHABLE_KEY)


exports.sendStripeKey = async (req, res, next) => {
  try {
    res.status(200).json({
      stripeKey: process.env.STRIPE_PUBLISHABLE_KEY
    })
  } catch (error) {
    console.log(error)
  }
};
exports.captureStripePayment = async (req, res, next) => {
  try {
    const paymentIntent = await stripe.paymentIntent.create({
      amount: req.body.amount,
      currency: 'usd',

      metadata: {integration_check: 'accept_a_payment'} // optional
    });
    
    res.status(200).json({
      success: true,
      client_secret: paymentIntent.client_secret
      // can send id too or more 
    })
  } catch (error) {
    console.log(error)
  }
};

//// captureStipePayment
// const session = await stripe.checkout.sessions.create({
//   line_items: [
//     {
//       // Provide the exact Price ID (for example, pr_1234) of the product you want to sell
//       price: '{{PRICE_ID}}',
//       quantity: 1,
//     },
//   ],
//   mode: 'payment',
//   success_url: `${YOUR_DOMAIN}?success=true`,
//   cancel_url: `${YOUR_DOMAIN}?canceled=true`,
// });

// res.redirect(303, session.url);