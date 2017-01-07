'use strict';
var messageListener = null;
var messageCallback = null;
var FORBIDDEN_DOMAINS = [
    'addons.mozilla.org'
];


function injectScriptToTab(script, tab) {
    return browser.tabs.executeScript(tab.id, {
        file: script,
        runAt: 'document_idle',
        allFrames: false
    });
}

function listenForTabs(callback) {
    browser.tabs.onUpdated.addListener(function(tabID, changeInfo, tab) {
        if (changeInfo.status === 'complete') {
            callback(tab);
        }
    });
}

function sendMessageToTab(message, tab) {
    return browser.tabs.sendMessage(tab.id, message);
}


function listenForMessages(callback) {
    if (messageListener != null) {
        browser.runtime.onMessage.removeListener(messageListener);
    }

    messageCallback = callback;
    messageListener = browser.runtime.onMessage.addListener(messageCallback);
}

function sendMessageToBackground(message) {
    return browser.runtime.sendMessage(message);
}

function getActiveTab() {
    return new Promise(function(resolve, reject) {
        browser.tabs.query({
            active: true,
            lastFocusedWindow: true
        }).then(function(tabs) {
            if (tabs.length === 0) {
                reject();
            } else {
                resolve(tabs[0]);
            }
        });
    });
}

function openOptionsPage() {
    browser.runtime.openOptionsPage();
}

function setBadgeText(associatedTab, str, backgroundColor) {
    var text = str.toString().length > 4 ? '∞' : str.toString();

    browser.browserAction.setBadgeBackgroundColor({
        color: backgroundColor,
        tabId: associatedTab.id
    });

    browser.browserAction.setBadgeText({
        text: text,
        tabId: associatedTab.id
    });
}


module.exports = {
    injectScriptToTab: injectScriptToTab,
    listenForTabs: listenForTabs,
    sendMessageToTab: sendMessageToTab,
    listenForMessages: listenForMessages,
    sendMessageToBackground: sendMessageToBackground,
    getActiveTab: getActiveTab,
    openOptionsPage: openOptionsPage,
    setBadgeText: setBadgeText,
    forbiddenDomains: FORBIDDEN_DOMAINS
};