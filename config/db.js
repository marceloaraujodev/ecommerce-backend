const mongoose = require('mongoose');

const connectDB = () => {
  mongoose.connect(process.env.DATABASE).then(() => console.log('Connected to the Database successfully')).catch((err) => {
    console.log('Connection to the database failed:', err)
    process.exit(1);
  });
}

module.exports = connectDB; 