'use strict';
var messageListener = null;
var messageCallback = null;
var FORBIDDEN_DOMAINS = [
    'addons.mozilla.org'
];


function injectScriptToTab(tab, script) {
    return browser.tabs.executeScript(tab.id, {
        file: script,
        runAt: 'document_idle',
        allFrames: true
    });
}

function listenForTabs(callback) {
    browser.tabs.onUpdated.addListener(function(tabID, changeInfo, tab) {
        if (changeInfo.status === 'complete') {
            callback(tab);
        }
    });
}

function sendMessageToTab(tab, message) {
    return browser.tabs.sendMessage(tab.id, message);
}


function listenForMessages(callback) {
    if (messageListener != null) {
        browser.runtime.onMessage.removeListener(messageListener);
    }

    messageCallback = callback;
    messageListener = browser.runtime.onMessage.addListener(messageCallback);
}

module.exports = {
    injectScriptToTab: injectScriptToTab,
    listenForTabs: listenForTabs,
    sendMessageToTab: sendMessageToTab,
    listenForMessages: listenForMessages,
    forbiddenDomains: FORBIDDEN_DOMAINS
};