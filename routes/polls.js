const express = require('express');
const router = express.Router();

// User Model
let User = require('../models/user');

// Poll Model
let Poll = require('../models/poll');

// Get All Polls present in the DB
router.get('/', function(req, res){
  // This query will give all the Polls inside the DB
  Poll.find({}, function(err, polls){
    if(err) throw err;
    else {
      res.render('polls', {
        polls:polls
      });
    }
  });
});

// Load Create Polls Page
router.get('/add', ensureAuthenticated, function(req, res){
  res.render('createpoll');
});

// Add Polls to the DB
router.post('/add', function(req, res){
  const title = req.body.title;
  const op = req.body.op;
  var options = [], votedUsersID = [];
  // Push all the options and initialize all votes to zero
  for (var i = 0; i < op.length; i++) {
    options.push({obj: op[i], votes: 0});
  }
  let newPoll = new Poll({
    title :title,
    authorID: req.user._id,
    authorName: req.user.username,
    options: options,
    votedUsersID: votedUsersID
  });
  // Save the Poll in the DB
  newPoll.save(function(err){
    if (err) throw err;
    else{
      req.flash('success', 'Poll Created!!');
      res.redirect('/polls/' + newPoll._id);
    }
  });

});

// Get all polls added by a user
router.get('/mypolls', ensureAuthenticated, function(req, res){
  // This query finds all the polls with authorID equal to the requested user's ID
  Poll.find({authorID: req.user._id}, function(err, polls){
    res.render('polls', {
      polls:polls
    });
  });
});

// Get a single Poll
router.get('/:id', function(req, res){
  Poll.findById(req.params.id, function(err, poll){
    res.render('poll', {
      poll:poll
    });
  });
});

// Vote!!
router.post('/vote/:id', function(req, res){
  console.log(req.body);

  // Look for the Poll Option with the given ID and given Option
  var conditions = {_id:req.params.id, 'options.obj':req.body.optionSelected}
  // Increment the count of number of votes on that particular Option
  Poll.update(conditions, {'$inc': {'options.$.votes': 1}}, function(err, doc){
    if (err) throw err;
    else {
      // Add the User's ID into the 'votedUsersID' Array
      if (req.body.userID != null || req.body.userID != 'null') {
        Poll.findByIdAndUpdate(req.params.id, {'$push': {'votedUsersID': req.body.userID}}, function(err, doc){
          if (err) throw err;
          else res.send('success');
        });
      } else {
        res.send('success');
      }
    }
  });
});

// Add the custom option
router.post('/customvote/:id', function(req, res){
  console.log(req.body);
  // Update the options array of the poll by pushing
  Poll.findByIdAndUpdate(req.params.id, {'$push': {'options': {'obj': req.body.optionSelected, 'votes': 1}}}, function(err, doc){
    if (err) throw err;
    else {
      // Add the User's ID into the 'votedUsersID' Array
      if (req.body.userID != null || req.body.userID != 'null') {
        Poll.findByIdAndUpdate(req.params.id, {'$push': {'votedUsersID': req.body.userID}}, function(err, doc){
          if (err) throw err;
          else res.send('success');
        });
      } else {
        res.send('success');
      }
    }
  });
});

// Send Poll Data for Charts.js
router.get('/getData/:id', function(req, res){
  Poll.findById(req.params.id, function(err, poll){
    if(err) throw err;
    else
      res.json({pollOption: poll.options, votedUsersID: poll.votedUsersID});
  });
});

// Delete Poll
router.delete('/:id', ensureAuthenticated, function(req, res){
  if(!req.user._id){
    res.status(401).send('Please Login');
  }

  let query = {_id:req.params.id}

  Poll.findById(req.params.id, function(err, poll){
    if(poll.authorID != req.user._id){
      res.status(401).send('Not Authorized');
    } else {
      Poll.remove(query, function(err){
        if(err){
          console.log(err);
        }
        req.flash('success', 'Poll deleted successfully!')
        res.send('success');
      });
    }
  });
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

// Export the module
module.exports = router;
