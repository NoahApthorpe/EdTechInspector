var savebutton = document.getElementById('savebutton');
var backbutton = document.getElementById('backbutton');
var enterinfobutton = document.getElementById('enterinfobutton');
var currentdistrict = document.getElementById('CurrentDistrict');
var currentgrade = document.getElementById('CurrentGrade');
var currentpreferredname = document.getElementById('CurrentPreferredName');
var currentfirstname = document.getElementById('CurrentFirstName');
var currentlastname = document.getElementById('CurrentLastName');
var currentemail = document.getElementById('CurrentEmail');
var currentid = document.getElementById('CurrentID');
var currentphone = document.getElementById('CurrentPhone');
var userid = document.getElementById('UserID');

document.addEventListener('DOMContentLoaded', function(e) {
    chrome.storage.local.get(['info'], function(result) {
        currentdistrict.textContent = result.info['district'];
        currentgrade.textContent = result.info['grade'];
        currentpreferredname.textContent = result.info['preferredname'];
        currentfirstname.textContent = result.info['firstname'];
        currentlastname.textContent = result.info['lastname'];
        currentemail.textContent = result.info['email'];
        currentid.textContent = result.info['id'];
        currentphone.textContent = result.info['phone'];
    });
    chrome.storage.local.get(['id'], function(result) {
        userid.textContent = result.id;
    });
});

savebutton.addEventListener('click', function(e) {
    var inputpreferredname = document.getElementById('InputPreferredName').value;
    var inputfirstname = document.getElementById('InputFirstName').value;
    var inputlastname = document.getElementById('InputLastName').value;
    var inputemail = document.getElementById('InputEmail').value;
    var inputid = document.getElementById('InputID').value;
    var inputphone = document.getElementById('InputPhone').value;
    var inputdistrict = document.getElementById('InputDistrict').value;
    var inputgrade = document.getElementById('InputGrade').value;
    chrome.runtime.sendMessage({preferredname: inputpreferredname,
                                firstname: inputfirstname,
                                lastname: inputlastname,
                                email: inputemail, 
                                id: inputid, 
                                phone: inputphone,
                                district: inputdistrict,
                                grade: inputgrade},
        function(response){
            if (response.response == "Success") {
                chrome.storage.local.get(['info'], function(result) {
                    currentpreferredname.textContent = inputpreferredname ? inputpreferredname : result.info['preferredname'];
                    currentfirstname.textContent = inputfirstname ? inputfirstname : result.info['firstname'];
                    currentlastname.textContent = inputlastname ? inputlastname : result.info['lastname'];
                    currentemail.textContent = inputemail ? inputemail : result.info['email'];
                    currentid.textContent = inputid ? inputid : result.info['id'];
                    currentphone.textContent = inputphone ? inputphone : result.info['phone'];
                    currentdistrict.textContent = inputdistrict ? inputdistrict : result.info['district'];
                    currentgrade.textContent = inputgrade ? inputgrade : result.info['grade'];
                });
            }
        });
    e.preventDefault();
});

backbutton.addEventListener('click', function(e) {
    window.location.href = "landing.html";
});

enterinfobutton.addEventListener('click', function(e) {
    window.location.href = "drop.html";
});