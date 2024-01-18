let tab;

chrome.action.onClicked.addListener(async () => {
  tab = chrome.tabs.create({url: chrome.runtime.getURL("index.html"), active:true});
});
  
chrome.runtime.onMessage.addListener(async (request) => {
  switch(request.type) {
      case 'OPEN_VIDEO':
        let url = chrome.runtime.getURL("index.html") + "?url=" + encodeURIComponent(request.url) + "&title=" + encodeURIComponent(request.title);
        if (request.audio) {
          url += "&audio=" + encodeURIComponent(request.audio);
        }
        if (request.cookie) {
          url += "&cookie=" + encodeURIComponent(request.cookie);
        }
        if (request.referrer) {
          url += "&referrer=" + encodeURIComponent(request.referrer);

          chrome.declarativeNetRequest.updateDynamicRules({
            removeRuleIds: [1],
            addRules: [
              {
                id: 1,
                priority: 1,
                condition: {
                  urlFilter: "https://ssrweb.zoom.us/cmr/replay/*"
                },
                action: {
                  type: "modifyHeaders",
                  requestHeaders: [
                    {header: "referer", operation: "set", value: request.referrer}
                  ]
                }
              }
            ]
          })
        }
        if (!tab) {
          tab = await chrome.tabs.create({url, active:true});
        } else {
          await chrome.tabs.update(tab.id, { active:true }).catch(async () => {
            tab = await chrome.tabs.create({url, active:true});
          })
        }
        break;
      default:
        console.warn("Unknown message type: " + request.type)
  }
})