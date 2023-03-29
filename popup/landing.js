      document.addEventListener("DOMContentLoaded", function(){
    document.getElementById("personalInfo").addEventListener("click", function(e){
        //console.log("in event");
        window.location.href = "popup.html";
        e.preventDefault();
    });
});