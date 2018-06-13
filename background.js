/**
 * @fileOverview background.js - background script for the extension
 */
chrome.runtime.onInstalled.addListener(function () {
  console.log('Extension installed');
  chrome.declarativeContent.onPageChanged.removeRules(undefined, function () {
    chrome.declarativeContent.onPageChanged.addRules([{
      conditions: [new chrome.declarativeContent.PageStateMatcher({
        pageUrl: { hostEquals: 'gre.etest.net.cn' },
      })],
      actions: [new chrome.declarativeContent.ShowPageAction()]
    }]);
  });
});

appendLog('Message listener added');
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'log') {
    handleLog(message);
  }
  if (message.type === 'imgSrc') {
    handleImgSrc(message, sendResponse);
  }
  if (message.type === 'LOGIN_STATUS') {
    handleLoginStatus(message, sender);
  }
  // indicates the response will be sent async
  return true;
});

let loginStatus = '';
let tabId = 0;

function loginFailureListener(tabId, changeInfo, tab) {
  if (loginStatus === 'FAIL' && changeInfo.status === 'complete') {
    appendLog('Fail loading complete; Relogin called');
    // chrome.tabs.executeScript(
    //   tab.id,
    //   { file: 'reLogin.js' }
    // );
    chrome.tabs.sendMessage(tab.id, {type: 'reLogin'});
    loginStatus = 'tryLogin';
  }
}

appendLog('Tab Updated listener added');
chrome.tabs.onUpdated.addListener(loginFailureListener);

/**
 * @function handleLoginStatus - when receives login status, add listener on page update
 * @param {Object} message 
 * @param {string} message.data - the status sent
 * @param {MessageSender} sender 
 */
function handleLoginStatus(message, sender) {
  if (message.data === 'LoginClicked') {
    // access the sender tab by sender.tab
    // tab.index, tab.url may be useful
    appendLog('login status listener added');
    chrome.tabs.onUpdated.addListener(
      function loginStatusListener(tabId, changeInfo, tab) {
        if (tab.id === sender.tab.id) {
          tabId = tab.id;
          if (changeInfo.status === 'loading' && /myStatus.do?/.test(changeInfo.url)) {
            appendLog('Login successful');
            loginStatus = 'SUCCESS';
            chrome.tabs.onUpdated.removeListener(loginStatusListener);
          }
          else if (changeInfo.status === 'loading' && !changeInfo.url) {
            appendLog('Login failed');
            loginStatus = 'FAIL'
            chrome.tabs.onUpdated.removeListener(loginStatusListener);
          }
        }
      });
  }
}

function appendLog(message) {
  $('#log').append(`
      <p>${message}</p>
    `);
}

function handleLog(message) {
  $('#log').append(`
      <p>${message.data}</p>
    `);
}

function handleImgSrc(message, sendResponse) {
  $('#captcha').append(`
    <img src="${message.data}">
    <input id="captchaInput" type="text">
    <button id="sendCaptcha" type="button">Send Captcha</button>
  `);
  $('#sendCaptcha').click(() => {
    sendResponse({
      captcha: $('#captchaInput').val()
    });
    $('#captcha').empty();
  });
}

$('#login').click(() => {
  chrome.tabs.query({
    url: '*://gre.etest.net.cn/*'
  }, (tabs) => {
    if (tabs[0]) {
      chrome.tabs.executeScript(
        tabs[0].id,
        { code: 'tryLogin()' }
      );
    }
    else {
      appendLog('No matched tab');
    }
  });
});