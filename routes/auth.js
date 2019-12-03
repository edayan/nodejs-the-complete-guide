const express = require('express');
const { check } = require('express-validator');
const authController = require('../controllers/auth');

const router = express.Router();

router.get('/login', authController.getLogin);

router.post('/login', authController.postLogin);

router.get('/signup', authController.getSignup);

router.post(
  '/signup',
  check('email')
    .isEmail()
    .withMessage('Please enter a valid email')
    .custom((value, { req }) => {
      if (value === 'test@test.com') {
        throw new Error('This email is forbidden');
      }
      return true;//for sucess case
    }),
  authController.postSignup
);

router.post('/logout', authController.postLogOut);

router.get('/reset', authController.getReset);

router.post('/reset', authController.postReset);

router.get('/new-password', authController.getNewPassword);

router.post('/new-password', authController.postNewPassword);

module.exports = router;
