document.addEventListener('DOMContentLoaded', function() {
    var button = document.getElementById('savebutton');
    // onClick's logic below:
    button.addEventListener('click', function() {
        var inputemail = document.getElementById('InputEmail').value;
        chrome.runtime.sendMessage({email: inputemail});
    });
});