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

//launches help page on download
chrome.runtime.onInstalled.addListener(function (object) {
  let externalUrl = "https://www.k12inspector.org/chrome-extension-guide";
  //let internalUrl = chrome.runtime.getURL("views/onboarding.html");

  if (object.reason === chrome.runtime.OnInstalledReason.INSTALL) {
      chrome.tabs.create({ url: externalUrl }, function (tab) {
          console.log("New tab launched with https://www.k12inspector.org/chrome-extension-guide");
      });
  }
});

// save info to storage
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (Object.keys(request).includes("location")) {
        //console.log("rece geo msg");
        chrome.storage.local.set({location: request.location}, function() {
            console.log("loc pushed" + request.location.latitude + ',' + request.location.longitude);
          });

        sendResponse({response: "Success"});

    }
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
                          'phone': undefined, 
                          'district': undefined,
                          'grade': undefined,
                          'location': undefined}};
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
        if (request.phone) {
          obj.info.phone = request.phone;
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
    chrome.storage.local.get(["setting"], function(setting) {
      if (setting.setting == "all" || whitelist.includes(getBaseDomainFromUrl(request.initiator))) {// getbasedomain returns "google.com"
        chrome.storage.local.get(['info'], function(result) {
          chrome.storage.local.get(['id'], function(userid) {
            chrome.storage.local.get(['location'], function(locResult) {
                let searchTerms = {};
                if (result.info['email'] != undefined) {
                    searchTerms['email'] = result.info['email'];
                }
                if (result.info['preferredname'] != undefined) {
                    searchTerms['preferredname'] = result.info['preferredname'];
                }
                if (result.info['firstname'] != undefined) {
                    searchTerms['firstname'] = result.info['firstname'];
                }
                if (result.info['lastname'] != undefined) {
                    searchTerms['lastname'] = result.info['lastname'];
                }
                if (result.info['phone'] != undefined) {
                    searchTerms['phone'] = result.info['phone'];
                }
                if (result.info['id'] != undefined) {
                    searchTerms['id'] = result.info['id'];
                }
                let location = {};
                if (Object.keys(locResult).length != 0) {
                    //console.log("storage loc update");
                    location = locResult.location;
                }
                //console.log("new loc:" + JSON.stringify(location));

                            // let searchTerms = {"email": result.info['email'],
                //                   "preferredname":result.info['preferredname'],
                //                   "firstname":result.info['firstname'],
                //                   "lastname":result.info['lastname'],
                //                   "id":result.info['id']};
                
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
                requestBaseDomain,
                result,
                userid,
                location
                );
        
                if (report.leak_url != null) {
                console.log(report);
                }
                // console.log(report);
        
                // send report here
                (function f() {
                const res = fetch('https://extension.k12inspector.org/save', {
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
                        response.text()
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
          });
        });
      };
    });
  },
  { urls: ["<all_urls>"] },
  ["requestBody"]
)