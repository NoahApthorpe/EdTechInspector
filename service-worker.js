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

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.email) {
      chrome.storage.local.get(['info'], function(obj) {
        console.log(obj);
        if (Object.keys(obj).length == 0) {
          obj = {'info': {'email': undefined,'ID': undefined}};
        };
        console.log(obj);
        obj.info.email = request.email;
        chrome.storage.local.set({info: obj.info}, function() {
          console.log('Value is set to ' + obj.info.email);
        });
      });
      // chrome.storage.local.remove(["info"],function(){
      //  })
    }
  }
);


// INTERCEPT REQUESTS
chrome.webRequest.onBeforeRequest.addListener(
  function (request) {
    // whitelist check
    // request.initiator looks like "https://www.google.com"
    if (whitelist.includes(getBaseDomain(request.initiator))) { // getbasedomain returns "google.com"
      chrome.storage.local.get(['info'], function(result) {
        let searchTerms = Object.values(result.info);
        
        if (request.method == "POST") {
          // GET INFO
          const reqURL = request.url;
          const requestHost = extractHostFromURL(reqURL);
          const requestBaseDomain = getBaseDomain(requestHost);
    
          const tabURL = request.initiator + "/"; // not complete url
          let tabHost = extractHostFromURL(tabURL);
    
          // CHECK IF THIRD PARTY!
          if (!isThirdParty(requestHost, tabHost)) {return ;};
    
          // TRACKER
          const tdsResult = tds.getTrackerData(reqURL, tabURL, request.type);
          // if (!tdsResult) {return;}
          // var tdsResult = {};
    
          // CHECK REQUEST
          report = checkRequest(
            request,
            searchTerms,
            tdsResult,
            request.timeStamp,
            requestBaseDomain
          );

          // send report here?
        };
      });
    };
  },
  { urls: ["<all_urls>"] },
  ["requestBody"]
)