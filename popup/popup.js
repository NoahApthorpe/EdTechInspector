var button = document.getElementById('savebutton');
var currentemail = document.getElementById('CurrentEmail');
var currentid = document.getElementById('CurrentID');

document.addEventListener('DOMContentLoaded', function() {
    chrome.storage.local.get(['info'], function(result) {
        currentemail.textContent = result.info['email'];
        currentid.textContent = result.info['ID'];
    });
});

button.addEventListener('click', function(e) {
    var inputemail = document.getElementById('InputEmail').value;
    chrome.runtime.sendMessage({email: inputemail});
    currentemail.textContent = inputemail;
    e.preventDefault();
});