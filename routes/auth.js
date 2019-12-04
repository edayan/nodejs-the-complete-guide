const express = require('express');
const { check, body } = require('express-validator');
const authController = require('../controllers/auth');
const User = require('../models/user');

const router = express.Router();

router.get('/login', authController.getLogin);

router.post(
  '/login',
  [
    body('email', 'Please enter a valid email')
      .isEmail()
      .normalizeEmail(),
    body(
      'password',
      'Please enter a password with only numbers and text and atleast 5 characters'
    )
      .isLength({ min: 5 })
      .isAlphanumeric()
      .trim()
  ],
  authController.postLogin
);

router.get('/signup', authController.getSignup);

router.post(
  '/signup',
  [
    check('email') //checks in body, params, cookies etc
      .isEmail()
      .withMessage('Please enter a valid email')
      .custom((value, { req }) => {
        if (value === 'test@test.com') {
          throw new Error('This email is forbidden');
        }

        return User.findOne({ where: { email: value } }).then(userDoc => {
          if (userDoc) {
            return Promise.reject('Email exists already');
          }
          //return true; //for sucess case
        });
      })
      .normalizeEmail(),
    body(
      'password', // checks for password in body only
      'Please enter a password with only numbers and text and atleast 5 characters'
    )
      .isLength({ min: 5 })
      .isAlphanumeric()
      .trim(),
    body('confirmPassword').custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Passwords doesn't match");
      }
      return true; //for sucess case
    })
  ],
  authController.postSignup
);

router.post('/logout', authController.postLogOut);

router.get('/reset', authController.getReset);

router.post('/reset', authController.postReset);

router.get('/new-password', authController.getNewPassword);

router.post('/new-password', authController.postNewPassword);

module.exports = router;
