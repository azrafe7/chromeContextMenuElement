(() => {
  let manifest = chrome.runtime.getManifest();
  const EXTENSION_NAME = manifest.name;
  console.log(EXTENSION_NAME + " v" + manifest.version);

  let clickedElement = null;
  let currTarget = null;
  let currTargets = [];

  function onMouseEvent(event) {
    clientPos = {
      x: event.clientX,
      y: event.clientY,
    }

    if (clickedElement == event.target) {
      // console.log(`[${EXTENSION_NAME}:CTX] return early`, clickedElement);
      return;
    }
    
    clickedElement = event.target;
    // console.log(`[${EXTENSION_NAME}:CTX] clicked:`, clickedElement);

    //console.log([event.which, event.target]);
    currTarget = event.target;
    currTargets = findTargetsAt(clientPos.x, clientPos.y);
    // console.log(`[${EXTENSION_NAME}:CTX] sorted:`, currTargets);
    if (currTargets) {
      imgOrVideos = currTargets.filter((element) => {
        const tag = element.tagName.toUpperCase();
        return tag === 'VIDEO' || tag === 'IMG';
      });
      currTarget = imgOrVideos ? imgOrVideos[0] : null;
      // console.log(`[${EXTENSION_NAME}:CTX] filtered:`, currTarget);
      chrome.runtime.sendMessage({event: 'element', data: currTarget?.outerHTML});
    }
  }
  
  document.addEventListener("mousedown", onMouseEvent, true);

  function findTargetsAt(x, y) {
    var elementsAtPoint = document.elementsFromPoint(x, y);
    var videos = [];
    var images = [];
    var others = [];
    for (const el of elementsAtPoint) {
      const tag = el.tagName.toUpperCase();
      if (tag === 'VIDEO') {
        videos.push(el);
      } else if (tag === 'IMG' || tag === 'SVG' || tag === 'CANVAS') {
        images.push(el);
      } else {
        others.push(el);
      }
    }

    var sortedTargets = [].concat(videos).concat(images).concat(others)
    return sortedTargets;
  }


  chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    console.log(`[${EXTENSION_NAME}:CTX] received:`, msg);
    const { event, data } = msg;

    let response = {};

    sendResponse(response);
    return true; // keep port alive
  });

})();
