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

// Validation Process
// Made a different route because the middleware was always going to the next() part
router.post('/validate', function(req, res){
  // Store values into the variables
  const name = req.body.name;
  const username = req.body.username;
  const email = req.body.email;
  const password = req.body.password;
  const password2 = req.body.password2;

  var response = []; // Alway create new empty array and it should NEVER be a global variable
  let emailValid = validateEmail(email);

  // Check for empty fields
  Object.keys(req.body).forEach(function(field){
	if(!req.body[field]) {
		response.push({field: field, type: "danger", message: "This field cannot be left empty."});
	}
  });

  // Basic Checks!
  if (!emailValid) {
	response.push({field: "email", type: "danger", message: "Please enter a valid E-mail Address."});
  }
  if (password.length < 6) {
	response.push({field: "password", type: "danger", message: "Password length too short!"});
  }
  if (password != password2) {
	response.push({field: "password2", type: "danger", message: "Passwords do not match."});
  }

  // Check if username and email are unique or not.
  // Used nested .then() because of asynchronous nature of Promises
  const usernamePromise = new Promise((resolve, resject) =>{
	User.findOne({username:username}, function(err, user){
	  if(err) reject(err);
	  if(Boolean(user)) resolve(true);
	  else resolve(false);
	});
  }).then(function(usernameTaken){
	// If the username field is not empty BUT the username is already in the DB
	if (usernameTaken === true && username != '') {
		response.push({field: "username", type: "danger", message: "Sorry! This username is already taken :("});
	}

	// emailPromise nested inside the .then() part of usernamePromise (because of asynchronous nature of JS)
	const emailPromise = new Promise((resolve, reject) => {
	  User.findOne({email:email}, function(err, user){
		if(err) reject(err);
		if(Boolean(user)) resolve(true);
		else resolve(false);
	  });
	}).then(function(emailTaken){
	  // If email is valid BUT already in the DB
	  if (emailTaken === true && emailValid) {
		response.push({field: "email", type: "danger", message: "This E-mail address is already registered!"});
	  }
	  // Send the response
	  res.send(response);
	});
  });
});

// Sign Up Process
router.post('/signup', function(req, res) {

  // Create a user and store the details
  let newUser = new User({
	name:req.body.name,
	email:req.body.email,
	username:req.body.username,
	password:req.body.password,
	providerID: 'local'
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
		  res.redirect('/users/login');
		}
	  });
	});
  });
});

// Load Login Page
router.get('/login', function(req, res){
  res.render('login');
});

// Login Process
router.post('/login', function(req, res, next){
  // Check the /models/passport.js file for Login method details
  passport.authenticate('local',{
	successRedirect:'/',
	failureRedirect:'/users/login',
	failureFlash: true
  })(req, res, next);

});

// Twitter OAuth
router.get('/auth/twitter',
  passport.authenticate('twitter', {
	scope: ['profile']
  }));

router.get('/auth/twitter/callback',
  passport.authenticate('twitter', {
	successRedirect: '/',
	failureRedirect: '/users/login',
	failureFlash: true
}));

// API to check if user is logged in or not
// If yes, then User's ID is send
router.get('/ifLoggedIn', function(req, res){
  console.log(req.user);
  if (req.user === undefined) {
	res.json({});
  } else {
	res.json({userID: req.user._id});
  }
});

// Logout Process
router.get('/logout', ensureAuthenticated, function(req, res){
  req.logout();
  req.flash('success', 'You are logged out');
  res.redirect('/');
});

// Load Settings Page
router.get('/settings', ensureAuthenticated, function(req, res){
  res.render('settings');
});

// Settings Process
router.post('/settings', [
  // Basic Validations done with Express-Validator
  check('current')
  .not()
  .isEmpty()
  .withMessage('You need to enter the current password'),
  check('new')
  .not()
  .isEmpty()
  .withMessage('You need to enter the new password'),
  check('confirmnew','New Passwords do not match')
  .exists()
  .custom((value, { req }) => value === req.body.new)
], function(req, res){

  const current = req.body.current;
  const newpassword = req.body.new;
  const confirmnew = req.body.confirmnew;

  // Check for Errors
  const validationErrors = validationResult(req);
  let errors = [];
  if(!validationErrors.isEmpty()) {
	Object.keys(validationErrors.mapped()).forEach(field => {
	  errors.push(validationErrors.mapped()[field]['msg']);
	});
  }

  if(errors.length){
	res.render('settings',{
	  errors:errors
	});
  } else {

	// Match Passwords
	bcrypt.compare(current, req.user.password, function(err, isMatch){
	  if(err) throw err;
	  if(isMatch){
		// Generate the Salt
		bcrypt.genSalt(10, function(err, salt){
		  if(err){
			console.log(err);
			return;
		  }
		  // Create the hashed password
		  bcrypt.hash(req.body.new, salt, function(err, hash){
			if(err){
			  console.log(err);
			}
			req.user.password = hash;
			// Save the User
			req.user.save(function(err){
			  if(err){
				console.log(err);
				return;
			  } else {
				req.flash('success', 'Password Changed Successfully');
				res.redirect('/');
			  }
			});
		  });
		});
	  } else {
		errors.push('Current password is worng');
		res.render('settings',{
		  errors:errors
		});
	  }
	});
  }
});

// Access Control
function ensureAuthenticated(req, res, next) {
  if(req.isAuthenticated()){
	return next();
  } else {
	req.flash('danger', 'Please Login');
	res.redirect('/users/login');
  }
}

// Check if E-mail is Valid or not
function validateEmail(email) {
  var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(email);
}

// Export the Module
module.exports = router;
