const path = require('path');
const nodemailer = require('nodemailer');
const hbs = require('nodemailer-express-handlebars');

const { host, port, user, password } = require('../config/mail');

const transport = nodemailer.createTransport({
  host,
  port,
  auth: {
    user,
    pass: password
  }
});

transport.use(
  'compile',
  hbs({
    viewEngine: {
      extName: '.html',
      partialsDir: path.resolve('./src/resources/mail/'),
      defaultLayout: false
    },
    viewPath: path.resolve('./src/resources/mail/'),
    extName: '.html'
  })
);

module.exports = transport;
