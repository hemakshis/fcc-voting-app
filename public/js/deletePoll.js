/* globals $:false */
/* globals console:false */
/* globals document:false */

$(document).ready(function(){
  // Getting the Poll ID from the Page URL
  var pollID = window.location.pathname.slice(7);
  $("#delete").on('click', function(e){
    e.preventDefault();
    $.ajax({
      type: 'DELETE',
      url: '/polls/' + pollID,
      success: function(data, response) {
        window.location.href = '/polls/mypolls'
      },
      error: function(err) {
        console.log(err);
      }
    });
  });
});
