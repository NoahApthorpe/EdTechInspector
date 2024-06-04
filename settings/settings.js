var savebutton = document.getElementById('savebutton');
var saved = document.getElementById("saved");
var debug_mode = document.getElementById('YesDebug');
var non_debug_mode = document.getElementById('NoDebug');


// ***** debug button
var debugbutton = document.getElementById('debug_savebutton');
var debugsaved = document.getElementById("debug_saved");

document.addEventListener('DOMContentLoaded', function() {
  saved.style.visibility = "hidden";
  debug_saved.style.visibility = "hidden";

});

savebutton.addEventListener('click', function(e) {
  var allwebsites = document.getElementById('AllWebsites');
  var edtechsites = document.getElementById('EdTechSites');

  var message = {setting: null};
  if (allwebsites.checked) {
    message.setting = "all";
  } else if (edtechsites.checked) {
    message.setting = "edtech";
  }

  chrome.runtime.sendMessage(message);
  saved.style.visibility = "visible";
  // e.preventDefault();
});


// ****** debug button 
debugbutton.addEventListener('click', function(e2) {
  var debug_mode = document.getElementById('YesDebug');
  var non_debug_mode = document.getElementById('NoDebug');
  var message = {debug_setting: null};
  
  if (debug_mode.checked) {
    message.debug_setting = "debug";
  } else if (non_debug_mode.checked) {
    message.debug_setting = "non-debug";
  }
  chrome.runtime.sendMessage(message); 
  console.log(message);
  debugsaved.style.visibility = "visible";
});