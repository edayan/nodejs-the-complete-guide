const express = require('express');
const { check, body } = require('express-validator');
const authController = require('../controllers/auth');

const router = express.Router();

router.get('/login', authController.getLogin);

router.post('/login', authController.postLogin);

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
        return true; //for sucess case
      }),
    body(
      'password', // checks for password in body only
      'Please enter a password with only numbers and text and atleast 5 characters'
    )
      .isLength({ min: 5 })
      .isAlphanumeric()
  ],
  authController.postSignup
);

router.post('/logout', authController.postLogOut);

router.get('/reset', authController.getReset);

router.post('/reset', authController.postReset);

router.get('/new-password', authController.getNewPassword);

router.post('/new-password', authController.postNewPassword);

module.exports = router;
