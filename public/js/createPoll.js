/* globals $:false */
/* globals console:false */
/* globals document:false */

// Function to check if all the input fields are filled up or not.
function checkInputs(){
  var empty = false;
  $(".pollOption").each(function(){
    if($(this).val() == ''){
      empty = true;
    }
  });
  // If any field is empty disable the buttons to avoid more addition/submission of the form
  if (empty) {
    $("#cpsubmit").attr('disabled', 'disabled');
    $("#moreop").attr('disabled', 'disabled');
  } else {
    $("#cpsubmit").removeAttr('disabled');
    $("#moreop").removeAttr('disabled');
  }
}

$(document).ready(function(){

  // Initial check for the 3 inputs
  $(document).keyup(function(){
    checkInputs();
  });

  // Add more options
  $("#moreop").on('click', function(){
    $("#options").append("<div class='input-group'><input class='form-control pollOption' type='text' placeholder='New Option' name='op'/><span class='input-group-addon'><a href='#' id='removeOption' class='text-danger'>Remove</a></span></div>");
    checkInputs();
  });

  // Delete options
  $("#cpform").on('click', '#removeOption', function(){
    $(this).parents('.input-group').remove();
    checkInputs();
  });

});
