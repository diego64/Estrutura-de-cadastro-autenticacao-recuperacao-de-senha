const path = require('path');
const nodemailer = require('nodemailer');
const hbs = require('nodemailer-express-handlebars');

const {host, port, user, pass, exphbs} = require('../config/mail.json');

const transport = nodemailer.createTransport({
    host,
    port,
    auth: { user, pass },
  });

  transport.use('compile', hbs({
    viewEngine:'handlebars',
    viewPath: path.resolve('./src/resources/mail/'),
    extName: '.html',
  })); 

  /*transport.use(
    'compile',
    hbs({
      viewEngine: exphbs.create({
        layoutsDir: path.resolve('./src/resources/mail/auth/'),
        partialsDir: path.resolve('./src/resources/mail/auth/'),
        defaultLayout: '',
        extname: '.html',
      }),
      viewPath: path.resolve('./src/resources/mail/auth/'),
      extName: '.html',
    })
  ); */

  module.exports = transport;