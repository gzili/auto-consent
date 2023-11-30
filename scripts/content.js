var cookieConsentNode = null;

const acceptTexts = [
  'lei',
  'suti',
  'priim',
  'patv',
  'supr',
];

function hasAcceptButton(node) {
  const buttons = node.querySelectorAll('button,a');
  for (const button of buttons) {
    const buttonText = button.textContent.toLowerCase();
    for (const acceptText of acceptTexts) {
      if (buttonText.includes(acceptText)) {
        return true;
      }
    }
  }

  return false;
}

function isCookieConsent(node) {
  const zIndex = parseInt(getComputedStyle(node).zIndex, 10);
  if (isNaN(zIndex) || zIndex < 1000) {
    return false;
  }

  if (!(node.textContent.includes('slapuk') || node.textContent.includes('sausain'))) {
    return false;
  }

  if (!hasAcceptButton(node)) {
    return false;
  }

  return true;
}

const rejectTexts = [
  'tik ',
  'atsisakyti',
  'atmesti',
];

const customizeTexts = [
  'rink',
  'pasirink',
  'tinkinti',
  'rodyti',
  'nustat',
  'tvark',
  'vald',
];

function findNodeContainingText(nodes, texts, callback) {
  for (const node of nodes) {
    const nodeText = node.textContent.toLowerCase();
    for (const text of texts) {
      if (nodeText.includes(text)) {
        callback(node);
        return node;
      }
    }
  }

  return null;
}

function highlightNodeCb(node) {
  node.style.cssText = 'border: 2px solid #00ff00 !important';
  console.log(node);
}

function clickNodeCb(node) {
  node.click();
}

function tryReject(node) {
  const buttons = node.querySelectorAll('button');
  if (findNodeContainingText(buttons, rejectTexts, highlightNodeCb) !== null) {
    return true;
  }

  const anchors = node.querySelectorAll('a');
  if (findNodeContainingText(anchors, rejectTexts, highlightNodeCb) !== null) {
    return true;
  }

  return false;
}

const submitTexts = [
  'leisti p',
  'įrašyti',
  'išsaugoti',
  'patvirtinti m',
  'patvirtinti p',
  'save',
];

function openSettings(node) {
  const buttons = node.querySelectorAll('button');
  if (findNodeContainingText(buttons, customizeTexts, clickNodeCb)) {
    return true;
  }

  const anchors = node.querySelectorAll('a');
  if (findNodeContainingText(anchors, customizeTexts, clickNodeCb)) {
    return true;
  }

  return false;
}


function submitSettings(node) {
  const buttons = node.querySelectorAll('button');
  if (findNodeContainingText(buttons, submitTexts, highlightNodeCb)) {
    return true;
  }

  const anchors = node.querySelectorAll('a');
  if (findNodeContainingText(anchors, submitTexts, highlightNodeCb)) {
    return true;
  }

  return false;
}

function getElementsWithZIndex() {
  const divsWithZIndex = [];
  for (const div of document.querySelectorAll('div')) {
    const style = getComputedStyle(div);
    const zIndexAttr = style.zIndex;
    if (zIndexAttr.charAt(0) === 'a') {
      continue;
    }
    const zIndex = parseInt(zIndexAttr, 10);
    if (isNaN(zIndex)) {
      continue;
    }
    divsWithZIndex.push({
      node: div,
      zIndex,
    });
  }
  divsWithZIndex.sort((a, b) => b.zIndex - a.zIndex);
  return divsWithZIndex.map(v => v.node);
}

function tryCustomize(node) {
  const settingsOpened = openSettings(node);
  if (!settingsOpened) {
    console.log('could not open settings');
    return false;
  }

  const settingsSubmitted = submitSettings(node);
  if (!settingsSubmitted) {
    console.log('could not submit settings 1');
    setTimeout(() => {
      if (!submitSettings(node)) {
        console.log('could not submit settings 2');
        const settingsDialog = getElementsWithZIndex()[0];
        if (!submitSettings(settingsDialog)) {
          console.log('could not submit settings 3', settingsDialog);
        }
      };
    });
    return false;
  }

  return true;
}

function handleCookieConsent(node) {
  cookieConsentNode = node;
  node.style.border = '2px solid red';

  const rejected = tryReject(node);
  if (rejected) {
    return;
  }

  tryCustomize(node);
}

function findCookiePopup() {
  if (cookieConsentNode !== null) {
    return;
  }

  const divs = document.querySelectorAll('div');
  for (const div of divs) {
    if (isCookieConsent(div)) {
      console.log('cookie consent found on DOMContentLoaded', div);
      handleCookieConsent(div);
      return;
    }
  }
}

document.addEventListener('DOMContentLoaded', findCookiePopup);

function searchChildNodes(node) {
  if (cookieConsentNode !== null) {
    return;
  }

  if (node.tagName === 'DIV') {
    if (isCookieConsent(node)) {
      console.log('cookie consent found with MutationObserver', node);
      handleCookieConsent(node);
      return;
    }
  }
  
  for (const childNode of node.childNodes) {
    searchChildNodes(childNode);
  }
}

const documentObserver = new MutationObserver((mutationList, observer) => {
  for (const mutation of mutationList) {
    for (const addedNode of mutation.addedNodes) {
      if (addedNode.tagName === 'DIV') {
        searchChildNodes(addedNode)

        if (cookieConsentNode !== null) {
          observer.disconnect();
          return;
        }
      }
    }
  }
});

documentObserver.observe(document.documentElement, { childList: true, subtree: true });
