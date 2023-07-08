let manifest = chrome.runtime.getManifest();
const EXTENSION_NAME = manifest.name;
console.log(EXTENSION_NAME + " v" + manifest.version);

const CONTEXTMENU_ID = 'ContextMenuElement_ID';
const SUB_CONTEXTMENU_ID = 'SubContextMenuElement_ID';
let contextMenuEntryVisible = true;

function createContextMenu(childTitle, visible) {
  chrome.contextMenus.removeAll(function() {
    chrome.contextMenus.create({
      id: CONTEXTMENU_ID,
      title: "ContextMenuElement",
      contexts: ["all"],
    });
    chrome.contextMenus.create({
      parentId: CONTEXTMENU_ID,
      id: SUB_CONTEXTMENU_ID,
      title: childTitle,
      contexts: ["all"],
      visible: visible,
    });
  });
}

chrome.runtime.onInstalled.addListener(() => {
  createContextMenu("Action", false);
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  console.log(`[${EXTENSION_NAME}:BG] onContextMenuClicked:`, [info, tab]);

  if (info.menuItemId === SUB_CONTEXTMENU_ID) {
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
      chrome.contextMenus.update(SUB_CONTEXTMENU_ID, { visible: false, title: 'no element' });
    }
  } else if (!contextMenuEntryVisible) {
    chrome.contextMenus.update(SUB_CONTEXTMENU_ID, { visible: true, title: 'Action on ' + request.data.substr(1, request.data.indexOf(' ')) });
  }

  // contextMenuEntryVisible = request.data != null;
  // let title = contextMenuEntryVisible ? 'Action on ' + request.data.substr(1, request.data.indexOf(' ')) : 'no element';
  // createContextMenu(title, contextMenuEntryVisible);
});