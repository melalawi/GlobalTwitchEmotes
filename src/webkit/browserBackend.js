var messageListener = null;
var messageCallback = null;
var FORBIDDEN_DOMAINS = [
    'chrome.google.com'
];


function injectScriptToTab(script, tab) {
    return new Promise(function(resolve) {
        chrome.tabs.executeScript(tab.id, {
            file: script,
            runAt: 'document_idle',
            allFrames: false
        }, function() {
            if (!chrome.runtime.lastError) {
                resolve(tab);
            }
        });
    });
}

function listenForTabs(callback) {
    chrome.tabs.onUpdated.addListener(function(tabID, changeInfo, tab) {
        if (changeInfo.status === 'complete') {
            callback(tab);
        }
    });
}

function sendMessageToTab(message, tab) {
    return new Promise(function(resolve) {
        chrome.tabs.sendMessage(tab.id, message, function() {
            if (!chrome.runtime.lastError) {
                resolve(tab);
            }
        });
    });
}


function listenForMessages(callback) {
    if (messageListener) {
        chrome.extension.onMessage.removeListener(messageListener);
    }

    messageCallback = callback;
    messageListener = chrome.runtime.onMessage.addListener(messageCallback);
}

function sendMessageToBackground(message) {
    return new Promise(function(resolve, reject) {
        chrome.runtime.sendMessage(message, function(response) {
            if (!chrome.runtime.lastError) {
                resolve(response);
            } else {
                reject(chrome.runtime.lastError);
            }
        });
    });
}

function getActiveTab() {
    return new Promise(function(resolve, reject) {
        chrome.tabs.query({
            active: true,
            lastFocusedWindow: true
        }, function(tabs) {
            if (tabs.length === 0) {
                reject();
            } else {
                resolve(tabs[0]);
            }
        });
    });
}

function openOptionsPage() {
    chrome.runtime.openOptionsPage();
}

function setBadgeText(associatedTab, str, backgroundColor) {
    var text = str.toString().length > 4 ? '∞' : str.toString();

    chrome.browserAction.setBadgeBackgroundColor({
        color: backgroundColor,
        tabId: associatedTab.id
    });

    chrome.browserAction.setBadgeText({
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