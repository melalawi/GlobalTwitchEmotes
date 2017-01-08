var messageListener = null;
var messageCallback = null;
var FORBIDDEN_DOMAINS = [
    'addons.mozilla.org'
];


function injectScriptToTab(script, tab) {
    return new Promise(function(resolve) {
        browser.tabs.executeScript(tab.id, {
            file: script,
            runAt: 'document_idle',
            allFrames: false
        }, function() {
            resolve(tab);
        });
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
    return new Promise(function(resolve) {
        browser.tabs.sendMessage(tab.id, message, function() {
            resolve(tab);
        });
    });
}


function listenForMessages(callback) {
    if (messageListener) {
        browser.runtime.onMessage.removeListener(messageListener);
    }

    messageCallback = callback;
    messageListener = browser.runtime.onMessage.addListener(messageCallback);
}

function sendMessageToBackground(message) {
    return new Promise(function(resolve, reject) {
        browser.runtime.sendMessage(message, function(response) {
            if (!browser.runtime.lastError) {
                resolve(response);
            } else {
                reject(browser.runtime.lastError);
            }
        });
    });
}

function getActiveTab() {
    return new Promise(function(resolve, reject) {
        browser.tabs.query({
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
    browser.tabs.create({
        active: true,
        url:  browser.extension.getURL('options/index.html')
    }, null);
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