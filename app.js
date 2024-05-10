const express = require('express');
require('dotenv').config();
const app = express();
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const fileUpload = require('express-fileupload');

// documentation
const YAML = require('yamljs');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = YAML.load('./swagger.yaml')
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// standards middleware - Parses JSON payload - Parses Multi-form form data
app.use(express.json());
app.use(express.urlencoded({extended: true}));

// cookies and files
app.use(cookieParser());
app.use(fileUpload({
  useTempFiles: true,
  tempFileDir: "/tmp/", 
}));

// test
app.set("view engine", "ejs");

// Logger Middleware
app.use(morgan('dev'));

// importing all ROUTES from the routes folder
const home = require('./routes/home');
const user = require('./routes/user');
const product = require('./routes/product');
const payment = require('./routes/payment');
const order = require('./routes/order');

//middleware
app.use('/api/v1', home);
app.use('/api/v1', user);
app.use('/api/v1', product);
app.use('/api/v1', payment);
app.use('/api/v1', order);

// test
app.get('/signuptest', (req, res) => {
  res.render('signupTest')
})

// export app
module.exports = app;