let tab;

chrome.action.onClicked.addListener(async () => {
  tab = chrome.tabs.create({url: chrome.runtime.getURL("index.html"), active:true});
});
  
chrome.runtime.onMessage.addListener(async (request) => {
  switch(request.type) {
      case 'OPEN_VIDEO':
        if (!tab) {
          tab = await chrome.tabs.create({url: chrome.runtime.getURL("index.html") + "?url=" + encodeURIComponent(request.url) + "&title=" + encodeURIComponent(request.title), active:true});
        } else {
          await chrome.tabs.update(tab.id, { active:true }).catch(async () => {
            tab = await chrome.tabs.create({url: chrome.runtime.getURL("index.html") + "?url=" + encodeURIComponent(request.url) + "&title=" + encodeURIComponent(request.title), active:true});
          })
        }
        break;
      default:
        console.warn("Unknown message type: " + request.type)
  }
})