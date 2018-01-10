/* globals $:false */
/* globals console:false */
/* globals document:false */

// Update the DB to increment the number of votes on the optionSelected
function addVote(URL, pollID, optionSelected, userID, custom) {
  $.ajax({
    type: 'POST',
    async: false,
    url: URL + pollID,
    data: {
      optionSelected: optionSelected,
      userID: userID,
      custom: custom
    },
    success: function(data, response) {
      if (response === 'success') {
        console.log('success');
      }
    }
  });
}


$(document).ready(function(){

  $("#addownoptionform").hide();

  // Hide and Show buttons
  $("#addownoption").on('click', function(){
    $("#addownoptionform").show();
    $("#vote").hide();
    $("#rembr").hide();
    $("#addownoption").hide();
    $("#voteownoption").attr('disabled', 'disabled');
  });

  $("#cancelownoption").on('click', function(){
    $("#addownoptionform").hide();
    $("#vote").show();
    $("#rembr").show();
    $("#addownoption").show();
  });

  var pollID = window.location.pathname.slice(7);
  var labels = [], values = [], r, g, b, bgColor = [], hoverBgColor = [];
  var ctx, myChart, userID = null;
  var url = '/polls/getData/' + pollID;

  // Get data of the respective poll from the DB
  $.getJSON(url)
  .done(function(data){
    // Check if a user is logged in or not
    $.getJSON('/users/ifLoggedIn', function(userData){
      console.log('userData', userData);
      if (userData.hasOwnProperty('userID')) {
        // Check if this userID has already voted or not
        // If yes, disable the vote button
        if (data.votedUsersID.indexOf(userData.userID) != -1) {
          $("#vote").attr('disabled', 'disabled');
          $("#vote").html('You\'ve already voted <i class="fa fa-check"></i>');
          $("#addownoption").hide();
        } else {
          userID = userData.userID;
        }
      } else { // If it does not have userID property, Check in the localStorage of the Browser
        if (localStorage.getItem(pollID) === 'true') {
          $("#vote").attr('disabled', 'disabled');
          $("#vote").html('You\'ve already voted <i class="fa fa-check"></i>');
          $("#addownoption").hide();
        }
      }
    });

    // Store data values for creating Chart
    for (var i = 0; i < data.pollOption.length; i++) {
      labels.push(data.pollOption[i].obj);
      values.push(data.pollOption[i].votes);
      r = Math.floor(Math.random()*255);
      g = Math.floor(Math.random()*255);
      b = Math.floor(Math.random()*255);
      bgColor.push('rgba(' + r + ', ' + g + ', ' + b +', 1)');
      hoverBgColor.push('rgba(' + r + ', ' + g + ', ' + b +', 0.5)');
    }

    ctx = document.getElementById('myChart').getContext('2d');

    myChart = new Chart(ctx, {
      type: 'doughnut',
      radius: "50%",
      innerRadius: "50%",
      data: {
        labels: labels,
        datasets: [{
          label: '# of Votes',
          data: values,
          backgroundColor: bgColor,
          hoverBackgroundColor: hoverBgColor
        }],
      },
      options:{
        responsive: false,
        maintainAspectRatio: true
      }
    });

  })

  $("#vote").on('click', function(e){
    e.preventDefault();
    var optionSelected = $("#select").find('option:selected').val();
    if (userID === null) {
      localStorage.setItem(pollID, 'true');
    }
    addVote('/polls/vote/', pollID, optionSelected, userID, false);
    // Update the chart
    var idx = myChart.data.labels.indexOf(optionSelected);
    var preVal = myChart.data.datasets[0].data[idx]
    myChart.data.datasets[0].data[idx] = preVal + 1;
    myChart.update();
    $("#vote").attr('disabled', 'disabled');
    $("#vote").html('You\'ve already voted <i class="fa fa-check"></i>');
    //$("#select").find('option:selected').removeAttr('selected');
  });

  // Check if user does not leaves the input empty
  $("#ownoption").keyup(function(){
    var optionAdded = $("#ownoption").val();
    if (optionAdded == '') {
      $("#voteownoption").attr('disabled', 'disabled');
    } else {
      $("#voteownoption").removeAttr('disabled');
    }
  })

  $("#voteownoption").on('click', function(e){
    e.preventDefault();
    optionSelected = $("#ownoption").val();
    // Add Vote
    addVote('/polls/customvote/', pollID, optionSelected, userID, true);
    // Push new data values to the Chart
    myChart.data.labels.push(optionSelected);
    myChart.data.datasets[0].data.push(1);
    // Update the Chart
    myChart.update();
    $("#addownoptionform").hide();
    $("#vote").show();
    $("#rembr").show();
    $("#addownoption").show();
    $("#vote").attr('disabled', 'disabled');
    $("#vote").html('You\'ve already voted <i class="fa fa-check"></i>')
    $("#addownoption").hide();
    // Append new option to the selection list
    $('#select').append('<option id="' + optionSelected + '">' + optionSelected + '</option>')
  });

});
