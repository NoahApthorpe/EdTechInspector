// This is the service worker script, which executes in its own context
// when the extension is installed or refreshed (or when you access its console).
// It would correspond to the background script in chrome extensions v2.

// Importing and using functionality from external files is also possible.
importScripts('service-worker-utils.js');
importScripts('leak_detector/leak_detector.js','leak_detector/base64.js','leak_detector/custom_map.js','leak_detector/lzstring.js','leak_detector/md2.js','leak_detector/md4.js','leak_detector/md5.js','leak_detector/sha_salted.js','leak_detector/sha1.js','leak_detector/sha256.js','leak_detector/sha512.js');
importScripts('tracker/psl.js','tracker/tracker.js','data/ddg_tds.js','data/entities.js','data/public_suffix.js','data/whitelist.js');

// INITIALIZE TRACKERS INFO
let tds = new Trackers();
// initialize with the blocklist info
tds.setLists([tds_tracker_info]);

// initialize unique user id on install
chrome.runtime.onInstalled.addListener(function(details){
  if(details.reason == "install"){
    chrome.storage.local.set({id: Math.random().toString(36).substr(2)}, function() {});
  }
});

// save info to storage
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (Object.keys(request).includes("setting")) {
      chrome.storage.local.set({setting: request.setting}, function() {
        console.log("setting changed!");
      });
    } else {
      chrome.storage.local.get(['info'], function(obj) {
        if (Object.keys(obj).length == 0) {
          obj = {'info': {'email': undefined,
                          'id': undefined,
                          'preferredname': undefined,
                          'firstname': undefined,
                          'lastname': undefined,
                          'district': undefined,
                          'grade': undefined}};
        };
        var changed = false;
        if (request.district) {
          obj.info.district = request.district;
          changed = true;
        };
        if (request.grade) {
          obj.info.grade = request.grade;
          changed = true;
        };
        if (request.preferredname) {
          obj.info.preferredname = request.preferredname;
          changed = true;
        };
        if (request.firstname) {
          obj.info.firstname = request.firstname;
          changed = true;
        };
        if (request.lastname) {
          obj.info.lastname = request.lastname;
          changed = true;
        };
        if (request.email) {
          obj.info.email = request.email;
          changed = true;
        };
        if (request.id) {
          obj.info.id = request.id;
          changed = true;
        };
  
        if (changed) {
          chrome.storage.local.set({info: obj.info}, function() {
            console.log('Info object is set to ' + obj.info);
          });
        }
        // chrome.storage.local.remove(["info"],function(){
        //  })
      })
      sendResponse({response: "Success"});
    };
  }
);


// INTERCEPT REQUESTS
chrome.webRequest.onBeforeRequest.addListener(
  function (request) {
    // whitelist check
    // request.initiator looks like "https://www.google.com"
    // console.log(getBaseDomainFromUrl(request.initiator));
    chrome.storage.local.get(["setting"], function(result) {
      if (result.setting == "all" || whitelist.includes(getBaseDomainFromUrl(request.initiator))) {// getbasedomain returns "google.com"
        chrome.storage.local.get(['info'], function(result) {
          let searchTerms = {"email":result.info['email'],
                            "preferredname":result.info['preferredname'],
                            "firstname":result.info['firstname'],
                            "lastname":result.info['lastname'],
                            "id":result.info['id']};
          
          // if (request.method == "POST") {
          // GET INFO
          const reqURL = request.url;
          const requestHost = extractHostFromURL(reqURL);
          const requestBaseDomain = getBaseDomain(requestHost);
    
          const tabURL = request.initiator + "/"; // not complete url
          let tabHost = extractHostFromURL(tabURL);
    
          // CHECK IF THIRD PARTY!
          // if (!isThirdParty(requestHost, tabHost)) {return ;};
    
          // TRACKER
          const tdsResult = tds.getTrackerData(reqURL, tabURL, request.type);
          // if (!tdsResult) {return;}
          // var tdsResult = {};
    
          // CHECK REQUEST
          var report = checkRequest(
            request,
            searchTerms,
            tdsResult,
            request.timeStamp,
            requestBaseDomain
          );
    
          if (report.leak_url != null) {
            console.log(report);
          }
          // console.log(report);
    
          // send report here
          (async function f() {
            const res = await fetch('http://127.0.0.1:5000/save', {
              headers : {
                  'Content-Type' : 'application/json'
              },
              method : 'POST',
              body : JSON.stringify( {
                  'report' : report
              })
            })
            .then(function (response){
          
                if(response.ok) {
                    response.json()
                    .then(function(response) {
                        console.log(response);
                    });
                }
                else {
                    console.log(response);
                    throw Error('Something went wrong');
                }
            })
            .catch(function(error) {
                console.log(error);
            });
          })();
        });
      };
    });
  },
  { urls: ["<all_urls>"] },
  ["requestBody"]
)