const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const flash = require('connect-flash');
const session = require('express-session');
const mongoose = require('mongoose');
const passport = require('passport');
const bcrypt = require('bcryptjs');
const config = require('./config/database');
const chart = require('chart.js');
const expressValidator = require('express-validator');

const PORT = process.env.PORT || 8080;

require('dotenv').config();

mongoose.Promise = require('bluebird');

mongoose.connect(config.database, {
  useMongoClient: true
});
let db = mongoose.connection;

// Check Connection
db.once('open', function(){
  console.log('Connected to MongoDB');
});

// Check DB Errors
db.on('error', function(err){
  console.log(err);
});

// User Model
let User = require('./models/user');

// Init App
var app = express();

// Load View Engine
app.set('views', path.join(__dirname,'views'));
app.set('view engine', 'pug');

// Body Parser Middleware
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

// Set Public Folder
app.use(express.static(path.join(__dirname, 'public')));

// Express Session Middleware
app.use(session({
  secret:'keyboard cat',
  resave:true,
  saveUninitialized:true
}));

// Express Messages Middleware
app.use(require('connect-flash')());
app.use(function(req, res, next){
  res.locals.messages = require('express-messages')(req, res);
  next();
});

// Express Validator Middleware
app.use(expressValidator({
  errorFormatter: function(param, msg, value){
    var namespace = param.split('.'),
    root = namespace.shift();
    formParam = root;
    while(namespace.length){
      formParam +='[' + namespace.shift() + ']';
    }
    return {
      param:formParam,
      msg:msg,
      value:value
    };
  }
}));

// Passport Config
require('./config/passport')(passport);

// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

app.get('*', function(req, res, next){
  res.locals.user = req.user || null;
  next();
});

// Home Route
app.get('/', function(req, res){
  res.render('index');
});

// Route Files
let users = require('./routes/users');
app.use('/users', users);
let polls = require('./routes/polls');
app.use('/polls', polls);

// Start Server
app.listen(PORT, function(){
  console.log('Server started on port 3000...');
});
