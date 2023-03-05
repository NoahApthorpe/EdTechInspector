var button = document.getElementById('savebutton');
var currentdistrict = document.getElementById('CurrentDistrict');
var currentgrade = document.getElementById('CurrentGrade');
var currentname = document.getElementById('CurrentName');
var currentemail = document.getElementById('CurrentEmail');
var currentid = document.getElementById('CurrentID');
var userid = document.getElementById('UserID');

document.addEventListener('DOMContentLoaded', function() {
    chrome.storage.local.get(['info'], function(result) {
        currentdistrict.textContent = result.info['district'];
        currentgrade.textContent = result.info['grade'];
        currentname.textContent = result.info['name'];
        currentemail.textContent = result.info['email'];
        currentid.textContent = result.info['id'];
    });
    chrome.storage.local.get(['id'], function(result) {
        userid.textContent = result.id;
    });
});

button.addEventListener('click', function(e) {
    var inputdistrict = document.getElementById('InputDistrict').value;
    var inputgrade = document.getElementById('InputGrade').value;
    var inputname = document.getElementById('InputName').value;
    var inputemail = document.getElementById('InputEmail').value;
    var inputid = document.getElementById('InputID').value;
    chrome.runtime.sendMessage({district: inputdistrict,
                                grade: inputgrade,
                                name: inputname,
                                email: inputemail, 
                                id: inputid},
        function(response){
            if (response.response == "Success") {
                currentdistrict.textContent = inputdistrict;
                currentgrade.textContent = inputgrade;
                currentname.textContent = inputname;
                currentemail.textContent = inputemail;
                currentid.textContent = inputid;
            }
        });
    e.preventDefault();
});