const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const TwitterStrategy = require('passport-twitter').Strategy;
const User = require('../models/user');
const config = require('../config/database');
const bcrypt = require('bcryptjs');
const key = require('keys.js');

require('dotenv').config();

module.exports = function(passport){
  // Twitter Strategy
  passport.use(new TwitterStrategy({
    callbackURL: '/users/auth/twitter/callback',
    consumerKey: process.env.TWITTER_Consumer_Key,
    consumerSecret: process.env.TWITTER_Consumer_Secret
  }, function(token, tokenSecret, profile, callback) {
      User.findOne({providerID:profile.id}, function(err, user){
        if(err) callback(err);
        if(Boolean(user)){
          return callback(err, user);
        } else {
          var email = profile.username + '@twiiter.com';
          newUser = new User({
            name: profile.displayName,
            username: profile.username,
            email: email,
            password: 'twitterlogger',
            providerID: profile.id
          });
          newUser.save(function(err, user){
            if(err) throw err;
            else return callback(err, user);
          });
        }

      });
  }));

  // Local Strategy
  passport.use(new LocalStrategy(function(username, password, done){
    // Match Username
    User.findOne({username:username}, function(err, user){
      if(err) throw err;
      if(!user){
        return done(null, false, {message:'Invalid Username'});
      }

      // Match Password
      bcrypt.compare(password, user.password, function(err, isMatch){
        if(err) throw err;
        if(isMatch){
          return done(null, user);
        } else {
          return done(null, false, {message:'Wrong Password'});
        }
      });
    });
  }));

  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });

  passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user){
      done(err, user);
    });
  });
}
