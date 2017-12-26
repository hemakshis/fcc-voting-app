const mongoose = require('mongoose');

const PollSchema = mongoose.Schema({
  title:{
    type: String,
    required: true
  },
  authorID:{
    type: String,
    required: true
  },
  authorName:{
    type: String,
    required: true
  },
  date:{
    type: Date,
    default: Date.now(),
  },
  options:[{obj: String, votes: Number}],
  votedUsersID: [String]
});

const Poll = module.exports = mongoose.model('Poll', PollSchema);
