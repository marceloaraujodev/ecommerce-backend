const nodemailer = require("nodemailer");

const emailSend = async (data) => {
  const transporter = nodemailer.createTransport({
    host: process.env.HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
  });
  
  const message = {
    from: 'ppzmarcelo@gmail.com', // sender address
    to: data.email,
    subject: data.subject,
    text: data.message, 
  }
  
  await transporter.sendMail(message);

}



module.exports = emailSend