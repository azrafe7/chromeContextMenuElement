let manifest = chrome.runtime.getManifest();
const EXTENSION_NAME = manifest.name;
console.log(EXTENSION_NAME + " v" + manifest.version);

let contextMenuEntryVisible = true;

function createContextMenu() {
  chrome.contextMenus.removeAll(function() {
    chrome.contextMenus.create({
      id: "onContextMenu",
      title: "ContextMenuElement",
      contexts: ["all"],
    });
  });
}

chrome.runtime.onInstalled.addListener(() => {
  createContextMenu();
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  console.log(`[${EXTENSION_NAME}:BG] onContextMenuClicked:`, [info, tab]);

  if (info.menuItemId === "onContextMenu") {
    chrome.tabs.sendMessage(
      tab.id,
      {
        event: "contextMenuClicked",
        data: info,
      },
      function(response) {
        console.log(`[${EXTENSION_NAME}:BG] received:`, response);
      }
    );
  }
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  console.log(`[${EXTENSION_NAME}:BG] received request:`, request);

  if (!request.data) {
    console.log(`[${EXTENSION_NAME}:BG] no data: hide contextMenu entry`);
    if (contextMenuEntryVisible) {
      chrome.contextMenus.update("onContextMenu", { visible: false });
    }
  } else if (!contextMenuEntryVisible) {
    chrome.contextMenus.update("onContextMenu", { visible: true });
  }

  contextMenuEntryVisible = request.data != null;
});