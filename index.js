// server
const app = require('./app');
const connectDB = require('./config/db');
require('dotenv').config();
const cloudinary = require('cloudinary');

// Db connection
connectDB();


//cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

app.listen(process.env.PORT, () => {
  console.log(`Server running on port: ${process.env.PORT}`);
})

