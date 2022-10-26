// This is the service worker script, which executes in its own context
// when the extension is installed or refreshed (or when you access its console).
// It would correspond to the background script in chrome extensions v2.

// console.log("This prints to the console of the service worker (background script)")

// Importing and using functionality from external files is also possible.
importScripts('service-worker-utils.js')
// importScripts('tracker/psl.js','tracker/tracker.js','data/ddg_tds.js','data/entities','data/public_suffix.js')

// If you want to import a file that is deeper in the file hierarchy of your
// extension, simply do `importScripts('path/to/file.js')`.
// The path should be relative to the file `manifest.json`.

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

// chrome.webRequest.onBeforeRequest.addListener(
//   function (request) {
//     let reqCancel = {
//       block: false,
//     };
//     chrome.storage.local.get("extension_switch", items => {
//       if(!items['extension_switch']){
//         return { cancel: reqCancel.block};
//       }
//     });
//     let reqTabId = activeTabId;
//     let inputElsOnTab = input_elements[reqTabId];
//     if (inputElsOnTab) {
//       const tabURL = inputElsOnTab.url;
//       const tabHost = extractHostFromURL(tabURL);
//       const reqUrl = request.url;
//       const requestHost = extractHostFromURL(reqUrl);
//       const requestBaseDomain = getBaseDomain(requestHost);
//       if(!isThirdParty(requestHost, tabHost) ) {
//         return {
//           cancel: false,
//         };
//       }
//       let search_terms = [];
//       let longerThan5Chars = inputElsOnTab.inputFields.filter(
//         (inputVal) => inputVal.value.length > 5
//       );
//       search_terms = search_terms.concat(longerThan5Chars);
//       if (!search_terms.length) {
//         return {
//           cancel: false,
//         };
//       }
//       const tdsResult = tds.getTrackerData(reqUrl, tabURL, request.type);
//       if(!window.thirdPartyControl && !tdsResult){
//         return {
//           cancel: false,
//         };
//       }
//       reqCancel = checkRequest(
//         request,
//         inputElsOnTab,
//         tdsResult,
//         request.timeStamp,
//         requestBaseDomain
//       );
//     }

//     if (reqCancel.block) {
//       if (!leaky_requests[reqTabId][reqCancel.domain]) {
//         leaky_requests[reqTabId][reqCancel.domain] = {
//           trackerDetails: reqCancel.trackerDetails,
//           details: [],
//           type: reqCancel.type,
//         };
//       }
//       reqCancel.inputFields.forEach((inputFieldDetails) => {
//         leaky_requests[reqTabId][reqCancel.domain]["details"].push({
//           inputField: inputFieldDetails,
//           timeStamp: reqCancel.timeStamp,
//         });
//       });
//       setBadge(reqTabId);
//       let reqStorageObj = {};
//       reqStorageObj["leaky_requests_" + reqTabId] = leaky_requests[reqTabId];
//       chrome.storage.local.set(reqStorageObj);

//       chrome.runtime.sendMessage({
//         type: "BGToPopupLeak",
//       });
//       chrome.tabs.sendMessage(reqTabId, {
//         message: "reqLeakOccurred",
//         xpaths: reqCancel.inputFields.map((el) => el.xpath),
//       });
//       return { cancel: (reqCancel.block && window.requestControl) };
//     }

//     return { cancel: (reqCancel.block && window.requestControl)};
//   },
//   { urls: ["<all_urls>"] },
//   ["requestBody", "blocking"]   
// );

chrome.webRequest.onBeforeRequest.addListener(
  function (request) {
    if (request.method == "POST") {
      // console.log(request.url)
      console.log(request.requestBody["raw"]);
    }

    requestBodies = []
    const reqBody = request.requestBody;
    if (request.method == "POST" && reqBody) {
      if (reqBody.raw) {
        try {
          requestBodies = reqBody.raw.map(function (data) {
            return decodeRequestBody(data);
          });
        } catch (error) {
          console.log(error);
        }
      }
    }
    console.log(requestBodies)
  },
  { urls: ["<all_urls>"] },
  ["requestBody"]
)