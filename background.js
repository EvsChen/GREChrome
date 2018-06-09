/**
 * @fileOverview background.js - background script for the extension
 */
chrome.runtime.onInstalled.addListener(function () {
  chrome.storage.sync.set({ color: '#3aa757' }, function () {
    console.log("The color is green.");
  });
  chrome.declarativeContent.onPageChanged.removeRules(undefined, function () {
    chrome.declarativeContent.onPageChanged.addRules([{
      conditions: [new chrome.declarativeContent.PageStateMatcher({
        pageUrl: { hostEquals: 'gre.etest.net.cn' },
      })],
      actions: [new chrome.declarativeContent.ShowPageAction()]
    }]);
  });
  chrome.runtime.onMessage.addListener((message, callback) => {
    if (message.type == 'currentUrl') {
      console.log(message.data)
    } 
  });
});