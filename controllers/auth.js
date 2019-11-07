const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const sendGridTransport = require('nodemailer-sendgrid-transport');
const crypto = require('crypto');

const User = require('../models/user');
const transporter = nodemailer.createTransport(
  sendGridTransport({
    auth: {
      api_key: 'my api key'
    }
  })
);

exports.getLogin = (req, res, next) => {
  let message = req.flash('error');
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render('auth/login', {
    path: '/login',
    pageTitle: 'Login',
    errorMessage: message
  });
};

exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  User.findOne({ where: { email: email } })
    .then(user => {
      if (!user) {
        req.flash('error', 'invalid email or password.');
        return res.redirect('/login');
      }

      bcrypt
        .compare(password, user.password)
        .then(doMatch => {
          if (doMatch) {
            req.session.isLoggedIn = true;
            req.session.user = user;
            return req.session.save(err => {
              console.log(err);
              res.redirect('/');
            });
          }
          req.flash('error', 'invalid email or password.');
          res.redirect('/login');
        })
        .catch(err => {
          console.log('err');
          res.redirect('/login');
        });
    })
    .catch(err => {
      console.log(err);
    });
};

exports.postLogOut = (req, res, next) => {
  req.session.destroy(err => {
    console.log(err);
    res.redirect('/');
  });
};

exports.getSignup = (req, res, next) => {
  let message = req.flash('error');
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }

  res.render('auth/signup', {
    path: '/signup',
    pageTitle: 'Signup',
    isAuthenticated: false,
    errorMessage: message
  });
};

exports.postSignup = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;
  User.findOne({ where: { email: email } })
    .then(userDoc => {
      if (userDoc) {
        req.flash('error', 'Email exists already');
        return res.redirect('/signup');
      }
      return bcrypt
        .hash(password, 12)
        .then(hashedPassword => {
          const user = new User({
            name: 'test',
            email: email,
            password: hashedPassword
          });
          return user.save();
        })
        .then(result => {
          res.redirect('/login');
          return transporter
            .sendMail({
              to: email,
              from: 'shop@node-complete.com',
              subject: 'Sign up completed',
              html: '<h1>You have successfully signed up!</h1>'
            })
            .catch(err => {
              console.log(err);
            });
        });
    })

    .catch(err => {
      console.log(err);
    });
};

exports.getReset = (req, res, next) => {
  let message = req.flash('error');
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }

  res.render('auth/reset', {
    path: '/reset',
    pageTitle: 'Reset Password',
    errorMessage: message
  });
};

exports.postReset = (req, res, next) => {
  crypto
    .randomBytes(32, (err, buffer) => {
      if (err) {
        console.log(err);
        return res.redirect('/reset');
      }

      const token = buffer.toString('hex');
      User.findOne({ where: { email: req.body.email } })
        .then(user => {
          console.log(user);
          if (!user) {
            req.flash('error', 'no active user with this email');
            return res.redirect('/reset');
          }

          user.resetToken = token;
          user.resetTokenExpiration = Date.now() + 3600000;
          return user.save();
        })
        .then(result => {
          res.redirect('/');
          transporter
            .sendMail({
              to: email,
              from: 'shop@node-complete.com',
              subject: 'Password reset',
              html: `
              <p>You requested for a password reset</p>
              <p>Click this Link to set <a href="http://localhost:3000/reset/${token}"></a> a new password.</p>
              `
            })
            .catch(err => {
              console.log(err);
            });
        });
    })
    .catch(err => {
      console.log(err);
    });
};

exports.getNewPassword = (req, res, next) => {
  const token = req.params.token;
  User.findOne({ where: { email: `saju.edayan@gmail.com` } }) //actually extract from token by going to db.
    .then(user => {
      let message = req.flash('error');
      if (message.length > 0) {
        message = message[0];
      } else {
        message = null;
      }

      res.render('auth/new-password', {
        path: '/new-password',
        pageTitle: 'New Password',
        errorMessage: message,
        userId: user.id
      });
    })
    .catch(err => console.log(err));
};
