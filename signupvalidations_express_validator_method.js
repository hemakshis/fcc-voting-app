const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
const { check, validationResult } = require('express-validator/check');

// User Model
let User = require('../models/user');

// Load Sign Up Page
router.get('/signup', function(req, res){
  res.render('signup');
});


// Sign Up Process
router.post('/signup', [
  check('name')
  .not()
  .isEmpty()
  .withMessage('Name is required'),
  // Check Username
  check('username')
  .not()
  .isEmpty()
  .withMessage('Username is required')
  .custom((value, {req}) => {
    return new Promise((resolve, reject) => {
      User.findOne({username:req.body.username}, function(err, user){
        if(err) {
          reject(new Error('Server error'))
        }
        if(Boolean(user)) {
          reject(new Error('Username already in use'))
        }
        resolve(true)
      });
    })
  }),
  // Check E-mail
  check('email')
  .not()
  .isEmpty()
  .withMessage('E-mail is Required')
  .isEmail()
  .withMessage('Invalid E-mail')
  .custom((value, {req}) => {
    return new Promise((resolve, reject) => {
      User.findOne({email:req.body.email}, function(err, user){
        if(err) {
          reject(new Error('Server Error'))
        }
        if(Boolean(user)) {
          reject(new Error('E-mail already in use'))
        }
        resolve(true)
      });
    });
  }),
  // Check Password
  check('password')
  .not()
  .isEmpty()
  .withMessage('Password is required')
  .isLength({min:6})
  .withMessage('Password must atleast 6 characters long'),
  // Check Password Confirmation
  check('password2', 'Passwords do not match')
  .exists()
  .custom((value, { req }) => value === req.body.password)
], function(req, res) {
  // Store values into the variables
  console.log(req.body);
  const name = req.body.name;
  const username = req.body.username;
  const email = req.body.email;
  const password = req.body.password;
  const password2 = req.body.password2;

  // Check for Errors
  const validationErrors = validationResult(req);
  let errors = [];
  if(!validationErrors.isEmpty()) {
    Object.keys(validationErrors.mapped()).forEach(field => {
      errors.push(validationErrors.mapped()[field]['msg']);
    });
  }
  console.log(errors);
  if(errors.length){
    res.render('signup',{
      errors:errors
    });
  } else {
    // Create a user and store the details
    let newUser = new User({
      name:name,
      email:email,
      username:username,
      password:password
    });

    // Generate the Salt
    bcrypt.genSalt(10, function(err, salt){
      if(err){
        console.log(err);
        return;
      }
      // Create the hashed password
      bcrypt.hash(newUser.password, salt, function(err, hash){
        if(err){
          console.log(err);
        }
        newUser.password = hash;
        // Save the User
        newUser.save(function(err){
          if(err){
            console.log(err);
            return;
          } else {
            req.flash('success', 'You\'ve Signed Up successfully');
            res.redirect('/');
          }
        });
      });
    });
  }

});
