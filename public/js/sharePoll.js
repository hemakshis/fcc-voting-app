$(document).ready(function(){
  $("#share").on('click', function(){
      var TweetURL = 'https://twitter.com/intent/tweet?text='
      var PollID = window.location.pathname.slice(7);
      var PageURL = 'https://votem3-hemakshis.herokuapp.com/polls/' + PollID;
      var text = 'Hey! Check out this poll on ' + PageURL + ' #votem3.'
      window.open(TweetURL + encodeURIComponent(text));
  });
});
