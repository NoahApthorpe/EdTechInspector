var savebutton = document.getElementById('savebutton');
var backbutton = document.getElementById('backbutton');
var currentdistrict = document.getElementById('CurrentDistrict');
var currentgrade = document.getElementById('CurrentGrade');
var currentpreferredname = document.getElementById('CurrentPreferredName');
var currentfirstname = document.getElementById('CurrentFirstName');
var currentlastname = document.getElementById('CurrentLastName');
var currentemail = document.getElementById('CurrentEmail');
var currentid = document.getElementById('CurrentID');
var userid = document.getElementById('UserID');

document.addEventListener('DOMContentLoaded', function() {
    chrome.storage.local.get(['info'], function(result) {
        currentdistrict.textContent = result.info['district'];
        currentgrade.textContent = result.info['grade'];
        currentpreferredname.textContent = result.info['preferredname'];
        currentfirstname.textContent = result.info['firstname'];
        currentlastname.textContent = result.info['lastname'];
        currentemail.textContent = result.info['email'];
        currentid.textContent = result.info['id'];
    });
    chrome.storage.local.get(['id'], function(result) {
        userid.textContent = result.id;
    });
});

savebutton.addEventListener('click', function(e) {
    var inputdistrict = document.getElementById('InputDistrict').value;
    var inputgrade = document.getElementById('InputGrade').value;
    chrome.runtime.sendMessage({district: inputdistrict,
                                grade: inputgrade},
        function(response){
            if (response.response == "Success") {
                chrome.storage.local.get(['info'], function(result) {
                    currentdistrict.textContent = inputdistrict ? inputdistrict : result.info['district'];
                    currentgrade.textContent = inputgrade ? inputgrade : result.info['grade'];
                });
            }
        });
    e.preventDefault();
});

backbutton.addEventListener('click', function(e) {
    window.location.href = "popup.html";
});