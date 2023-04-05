// This is the service worker script, which executes in its own context
// when the extension is installed or refreshed (or when you access its console).
// It would correspond to the background script in chrome extensions v2.

// Importing and using functionality from external files is also possible.
importScripts('service-worker-utils.js'); 
importScripts('leak_detector/leak_detector.js','leak_detector/base64.js','leak_detector/custom_map.js','leak_detector/lzstring.js','leak_detector/md2.js','leak_detector/md4.js','leak_detector/md5.js','leak_detector/sha_salted.js','leak_detector/sha1.js','leak_detector/sha256.js','leak_detector/sha512.js');
importScripts('tracker/psl.js','tracker/tracker.js','data/ddg_tds.js','data/entities.js','data/public_suffix.js');

// importing top edtech list
//import {topEdtech} from './data/edtech.js';

// THIS IS THE TEST CASE
// const searchTerms =['mypwd111111111111', 'cosicadam0+cision.com@gmail.com', '11111@gmail.com'];
// const URL = "https://www.awin1.com/a/b.php?merchantId=6604&hash=efd356ba6de9ca3f73f09823bff72f5dc8bdc026324c00350a94d4431963e96c&bId=HLEX_60d441ba361b17.54766982";
// const URL2 = "https://www.facebook.com/tr/?id=906035439747206&ev=SubscribedButtonClick&dl=https://www.independent.co.uk/login?regSourceMethod=login%20overlay&rl=https://www.independent.co.uk/&if=false&ts=1649147016136&cd[buttonFeatures]={'classList':'','destination':'https://policies.google.com/privacy?hl=en','id':'','imageUrl':'','innerText':'Privacy notice','numChildButtons':0,'tag':'a','name':''}&cd[buttonText]=Privacy notice&cd[formFeatures]=[]&cd[pageFeatures]={'title':'Log in'}&cd[parameters]=[]&sw=1920&sh=1080&udff[em]=e4920de3704773fb3a5fc884b548e110f930a5b7d17b6b97eb87bba74e6d696d&v=2.9.57&r=stable&a=tmgoogletagmanager&ec=2&o=2078&it=1649146999513&coo=false&es=automatic&tm=3&exp=p0&rqm=GET";
// const leak_detector = new LeakDetector(
//   searchTerms,
//   (precompute_hashes = true),
//   (hash_set = LIKELY_HASHES),
//   (hash_layers = 3),
//   (precompute_encodings = true),
//   (encoding_set = ENCODINGS_NO_ROT),
//   (encoding_layers = 3),
//   (debugging = false)
// );
// url_leaks = leak_detector.check_url(URL, encoding_layers=3)
// console.log(url_leaks)


// var searchTerms = chrome.storage.local.get(['info'], function(result) {
//   console.log(Array.from(result.info));
//   return Array.from(result.info);
// });

// // SEARCH TERMS
// searchTerms = chrome.storage.local.get(['info'], function(result) {
//   console.log(result.info+" initialize");
//   return result.info;
// });

// INITIALIZE TRACKERS INFO
let tds = new Trackers();
// initialize with the blocklist info
tds.setLists([tds_tracker_info]);

// keep track of edtech data to store in server
let edtechData = [];

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
    chrome.storage.local.get(['info'], function(result) {
      let searchTerms = Object.values(result.info);
      let isEdtech = false;
      
      if (request.method == "POST" || request.method == "GET") {
        // PRINT TEST
        // console.log(searchTerms);
        // console.log("This is the raw data:", request.requestBody["raw"]);
  
        console.log("this is a " + request.method + "method");

        // GET INFO
        const reqURL = request.url;
        const requestHost = extractHostFromURL(reqURL);
        const requestBaseDomain = getBaseDomain(requestHost);
  
        const tabURL = request.initiator + "/"; // not complete url
        let tabHost = extractHostFromURL(tabURL);

        // check if tabHost in top edtech
        /*
        if (topEdtech.includes(tabHost)) {
            console.log("host is edtech");
            isEdtech = true;
        }
        */
  
        // CHECK IF THIRD PARTY!
        if (!isThirdParty(requestHost, tabHost)) {
            console.log(requestHost + " not a third party for " + tabHost);
            return;
        };
  
        // TRACKER
        const tdsResult = tds.getTrackerData(reqURL, tabURL, request.type);
        // if (!tdsResult) {return;}
        // var tdsResult = {};
  
        // CHECK REQUEST
        result = checkRequest(
          request,
          searchTerms,
          tdsResult,
          request.timeStamp,
          requestBaseDomain
        );
      };

      //if (isEdtech) {
     //  edtechData.push(result.info);
     // }

        console.log("result:" + JSON.stringify(result.info));

        // Getting data from server
        /*
        fetch('http://127.0.0.1:5000/all', {
            method: 'GET',
            })
            .then((data) => {
                console.log('Success:', data);
            })
            .catch((error) => {
                console.error('Error:', error);
        });
        */

        
        // Send data to server
        const serverURL = 'http://127.0.0.1:5000/save'; //this is dev url; change to prod later
        fetch(serverURL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(result.info), // sending result.info for now but may change later
            })
            .then((data) => {
                console.log('Success:', data);
            })
            .catch((error) => {
                console.error('Error:', error);
        });
        

      return result.info;
    });
  },
  { urls: ["<all_urls>"] },
  ["requestBody"]
)