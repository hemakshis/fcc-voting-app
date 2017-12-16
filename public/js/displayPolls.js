/* globals $:false */
/* globals console:false */
/* globals document:false */

$(document).ready(function(){

  var colors = [
    {bg: 'primary', btn: 'success'},
    {bg: 'success', btn: 'primary'},
    {bg: 'info', btn: 'dark'},
    {bg: 'warning', btn: 'danger'},
    {bg: 'dark', btn: 'info'},
    {bg: 'danger', btn: 'warning'}
  ];

  $(".card").each(function(i, obj){
    var ran = colors[Math.floor(Math.random() * colors.length)];
    $(this).addClass("bg-" + ran.bg);
    $(this).find('a').addClass("btn-" + ran.btn);
  });

});
