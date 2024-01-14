var cookieConsentNode = null;

function hasCookieConsentText(node) {
  return node.textContent.includes('slapuk') || node.textContent.includes('sausainiuk');
}

const heightCheckEl = document.createElement('div');
heightCheckEl.style.height = '1px';
heightCheckEl.style.width = '1px';

function isVisible(el) {
  if (el.nodeName == 'BODY') {
    return true;
  }

  let rect = el.getBoundingClientRect();
  if (rect.height === 0) {
    el.append(heightCheckEl);
    rect = el.getBoundingClientRect();
    heightCheckEl.remove();
    if (rect.height === 0) {
      return false;
    }
  }

  const style = getComputedStyle(el);
  if (style.position === 'fixed') {
    return true;
  }

  return isVisible(el.parentElement);
}

const buttonIdentifiers = [
  'button',
  'btn'
];

function isButtonAnchor(node) {
  const className = node.className.toLowerCase();
  const id = node.id.toLowerCase();
  for (const c of buttonIdentifiers) {
    if (className.includes(c) || id.includes(c)) {
      return true;
    }
  }
  return false;
}

function findButtonContainingText(node, texts) {
  const buttons = node.querySelectorAll('button,*[role="button"]');
  for (const button of buttons) {
    const buttonText = button.textContent.toLowerCase();
    for (const text of texts) {
      if (buttonText.includes(text)) {
        return button;
      }
    }
  }

  const anchors = node.querySelectorAll('a');
  for (const anchor of anchors) {
    if (!isButtonAnchor(anchor)) {
      continue;
    }

    const textContent = anchor.textContent.toLowerCase();
    for (const text of texts) {
      if (textContent.includes(text)) {
        return anchor;
      }
    }
  }

  return null;
}

function findButtonsContainingText(node, texts) {
  const result = [];
  
  const buttons = node.querySelectorAll('button');
  for (const button of buttons) {
    const buttonText = button.textContent.toLowerCase();
    for (const text of texts) {
      if (buttonText.includes(text)) {
        result.push(button);
      }
    }
  }

  const roleButtons = node.querySelectorAll('[role="button"]');
  for (const roleButton of roleButtons) {
    const buttonText = roleButton.textContent.toLowerCase();
    for (const text of texts) {
      if (buttonText.includes(text)) {
        result.push(roleButton);
      }
    }
  }

  const anchors = node.querySelectorAll('a');
  for (const anchor of anchors) {
    if (!isButtonAnchor(anchor)) {
      continue;
    }

    const textContent = anchor.textContent.toLowerCase();
    for (const text of texts) {
      if (textContent.includes(text)) {
        result.push(anchor);
      }
    }
  }

  return result.filter(button => button.getBoundingClientRect().height <= 100);
}

const acceptTexts = [
  'lei',
  'suti',
  'priim',
  'patv',
  'supr',
  'ok',
  'gerai'
];

function hasAcceptButton(node) {
  const buttons = node.querySelectorAll('button,*[role="button"]');
  for (const button of buttons) {
    const buttonText = button.textContent.toLowerCase();
    for (const acceptText of acceptTexts) {
      if (buttonText.includes(acceptText)) {
        return true;
      }
    }
  }

  const anchors = node.querySelectorAll('a');
  for (const anchor of anchors) {
    if (!isButtonAnchor(anchor)) {
      continue;
    }

    const textContent = anchor.textContent.toLowerCase();
    for (const acceptText of acceptTexts) {
      if (textContent.includes(acceptText)) {
        return true;
      }
    }
  }

  return false;
}

function isCookieConsent(node) {
  const zIndex = parseInt(getComputedStyle(node).zIndex, 10);
  if (isNaN(zIndex) || zIndex <= 0) {
    return false;
  }

  if (!hasCookieConsentText(node)) {
    return false;
  }

  if (!hasAcceptButton(node)) {
    return false;
  }

  return true;
}

const rejectTexts = [
  'tik b',
  'atsisakyti',
  'atme',
  'su būtin',
  'nesut',
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

function highlightNode(node) {
  node.style.cssText = 'border: 2px solid #00ff00 !important';
  console.log(node);
}

function clickNode(node) {
  node.click();
  console.log('clicked node', node);
}

function tryReject(node) {
  const buttons = findButtonsContainingText(node, rejectTexts);
  for (const button of buttons) {
    if (isVisible(button)) {
      clickNode(button);
      return true;
    }
  }

  return false;
} 

const customizeTexts = [
  'rink',
  'pasirink',
  'tinkinti',
  'rodyti',
  'nustat',
  'tvark',
  'vald',
  'detaliau',
];

function openSettings(node) {
  const buttons = findButtonsContainingText(node, customizeTexts);
  for (const button of buttons) {
    if (isVisible(button)) {
      clickNode(button);
      console.log('opened settings', button);
      return true;
    }
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
  'patvirtinti t',
  'patvirtintip',
];

function submitSettings(node) {
  const buttons = node.querySelectorAll('button');
  if (findNodeContainingText(buttons, submitTexts, clickNode)) {
    return true;
  }

  const anchors = node.querySelectorAll('a');
  if (findNodeContainingText(anchors, submitTexts, clickNode)) {
    return true;
  }

  return false;
}

function getElementsWithZIndex() {
  const divsWithZIndex = [];
  for (const div of document.querySelectorAll('div')) {
    const style = getComputedStyle(div);
    const zIndexValue = style.zIndex;
    if (zIndexValue.charAt(0) === 'a') {
      continue;
    }
    const zIndexInt = parseInt(zIndexValue, 10);
    if (zIndexInt <= 0) {
      continue;
    }
    divsWithZIndex.push({
      node: div,
      zIndex: zIndexInt,
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

  if (!submitSettings(node)) {
    console.log('could not submit settings immediately');
    setTimeout(() => {
      if (!submitSettings(node)) {
        console.log('could not submit settings after timeout');
        const elementsWithZIndex = getElementsWithZIndex();
        for (const el of elementsWithZIndex) {
          if (submitSettings(el)) {
            return true;
          }
        }
        console.log('could not submit settings by z-index');
      };
    });
  }

  return false;
}

function hasVisibleCheckbox(node) {
  const checkboxes = node.querySelectorAll('input[type="checkbox"],*[role="checkbox"]');

  for (const checkbox of checkboxes) {
    if (isVisible(checkbox)) {
      return true;
    }
  }

  return false;
}

function handleCookieConsent(node) {
  cookieConsentNode = node;
  node.style.border = '2px solid red';

  if (tryReject(node)) {
    console.log('cookie consent rejected');
    return;
  }

  if (hasVisibleCheckbox(node)) {
    console.log('cookie consent type: checkbox')
    if (submitSettings(node)) {
      console.log('submitted selection');
    } else {
      console.log('could not submit selection');
    }
    return;
  }

  console.log('cookie consent type: settings');
  tryCustomize(node);
}

function deepSearchForCookieConsent(node) {
  if (cookieConsentNode !== null) {
    return;
  }

  if (node.tagName === 'DIV') {
    if (isCookieConsent(node)) {
      console.log('cookie consent found using MutationObserver', node);
      handleCookieConsent(node);
      return;
    }
  }
  
  for (const childNode of node.childNodes) {
    deepSearchForCookieConsent(childNode);
  }
}

const documentObserver = new MutationObserver((mutationList, observer) => {
  for (const mutation of mutationList) {
    for (const addedNode of mutation.addedNodes) {
      if (addedNode.tagName === 'DIV') {
        deepSearchForCookieConsent(addedNode)

        if (cookieConsentNode !== null) {
          observer.disconnect();
          return;
        }
      }
    }
  }
});

function findCookieConsent() {
  const nodes = getElementsWithZIndex();
  for (const node of nodes) {
    if (!hasCookieConsentText(node)) {
      continue;
    }

    // if (!isVisible(node)) {
    //   continue;
    // }

    if (!hasAcceptButton(node)) {
      continue;
    }

    console.log('cookie consent found on load', node);
    handleCookieConsent(node);
    break;
  }

  if (cookieConsentNode === null) {
    documentObserver.observe(document.body, { childList: true, subtree: true });
  }
}

findCookieConsent();
