var savebutton = document.getElementById('savebutton');
var saved = document.getElementById("saved");

document.addEventListener('DOMContentLoaded', function() {
  saved.style.visibility = "hidden";
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