/* globals $:false */
/* globals console:false */
/* globals document:false */

var fields = ['name', 'username', 'email', 'password', 'password2'];

function AJAXSignupValidations (hasBeenFocused) {
  var $input = $("input"), $name = $("#name"), $email = $("#email"), $username = $("#username");
  var $password = $("#password"), $password2 = $("#password2");
  var res = [];
  var errors = 0;
  // Send all the field values to server to get vaidated
  $.ajax({
    data: {
      name: $name.val(),
      username: $username.val(),
      email: $email.val(),
      password: $password.val(),
      password2: $password2.val()
    },
    async: false,
    type: 'POST',
    url: '/users/validate',
    success: function(data) {
      var id;

      // For each field check what to display, either errors or a green check mark
      for (var i = 0; i < fields.length; i++) {
        // Do this only for focused fields
        if (hasBeenFocused.indexOf(fields[i]) != -1) {
          // If this field is present inside the data array returned by the server
          // Then it is an error message
          // Because the server is sending only error messages
          res = $.grep(data, function(e) {return e.field === fields[i]});
          if (res.length) {
            errors++;
            id = "#small-" + res[0].field;
            $(id).html(res[0].message);
            $(id).addClass('text-danger');
            id = "#" + res[0].field + "-span";
            $(id).removeClass('input-group-addon');
            $(id).html("");
          } else {
            id = "#small-" + fields[i];
            $(id).html("");
            $(id).addClass('text-success');
            $(id).removeClass('text-danger');
            id = "#" + fields[i] + "-span";
            $(id).addClass('input-group-addon');
            $(id).html('<i class="fa fa-check text-success"></i>');
          }
        }
      }
    }
  });
  // Sends true if zero errors are found
  return errors === 0;
}

$(document).ready(function() {
  // An array to check on which input fields the user has clicked to give input
  var hasBeenFocused = [];
  var attrName, valid = 0, onSubmit = null;
  var timeout = null;

  // Checking the input field values on every input will lead to a lot of AJAX Calls
  // This may slow down the server, a lot of DB queries and lots of network traffic
  $("input").on('input', function(e) {

    // Get the name of the input field on which currently the user is typing
    attrName = $(this).attr('name');
    // If this field is not present in the array add it
    if (hasBeenFocused.indexOf(attrName) === -1) {
      hasBeenFocused.push(attrName);
    }

    clearTimeout(timeout);
    // Calling AJAX Validations after every 0.5 seconds
    timeout = setTimeout(function() {
      AJAXSignupValidations(hasBeenFocused);
    }, 500);

  });

  $("#signup-btn").on('click', function(){
    // Make all the fields focused
    hasBeenFocused = fields;
    // If it returns true the form will be submitted else not
    return AJAXSignupValidations(hasBeenFocused);
  });

});
