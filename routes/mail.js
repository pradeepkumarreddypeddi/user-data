var express = require('express');
var mail = express.Router();
var nodemailer = require('nodemailer');

    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'uiop2216@gmail.com',
          pass: '9908939412p'
        }
      });
      
      var mailOptions = {
        from: 'uiop2216@gmail.com',
        to: 'pradeep.p@darwinbox.io',
        subject: 'Sending Email using Node.js',
        text: 'That was easy!'
      };
      
      transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent success: ');
          res.render("home")
        }
      });
    


module.exports = mail;
