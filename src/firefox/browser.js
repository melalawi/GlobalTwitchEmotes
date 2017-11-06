const FORBIDDEN_DOMAINS = [
    'addons.mozilla.org'
];

var tabListener = null;

function isBackgroundScript() {
    return new Promise(function(resolve, reject) {
        if (browser.extension.getBackgroundPage() === window) {
            resolve();
        } else {
            reject();
        }
    });
}

function addOnMessageCallback(callback) {
    browser.runtime.onMessage.removeListener(callback);
    browser.runtime.onMessage.addListener(callback);
}

function removeOnMessageCallback(callback) {
    browser.runtime.onMessage.removeListener(callback);
}

function sendMessageToTab(tab, message, onResponseCallback) {
    browser.tabs.sendMessage(tab.id, message, onResponseCallback);
}

function sendMessageToBackground(message, onResponseCallback) {
    browser.runtime.sendMessage(message, onResponseCallback);
}


function loadStorage(storageType) {
    return browser.storage[storageType].get(null);
}

function saveStorage(data, storageType) {
    return browser.storage[storageType].set(data);
}

function injectScriptToTab(script, tab, allFrames) {
    return browser.tabs.executeScript(tab.id, {
        file: script,
        runAt: allFrames === true ? 'document_idle' : 'document_start',
        allFrames: allFrames
    });
}

function listenForTabs(callback) {
    if (tabListener !== null) {
        browser.tabs.onUpdated.removeListener(tabListener);
    }

    tabListener = function(tabID, changeInfo, tab) {
        if (changeInfo.status === 'complete') {
            callback(tab);
        }
    };

    browser.tabs.onUpdated.addListener(tabListener);
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

function reloadTab(tab) {
    return browser.tabs.reload(tab.id);
}

function openOptionsPage() {
    browser.runtime.openOptionsPage();
}

function setBadgeText(tab, string, backgroundColor) {
    var text = string.length > 4 ? '∞' : string;

    browser.browserAction.setBadgeBackgroundColor({
        color: backgroundColor,
        tabId: tab.id
    });

    browser.browserAction.setBadgeText({
        text: text,
        tabId: tab.id
    });
}

function getURL(url) {
    return browser.extension.getURL(url);
}

module.exports = {
    isBackgroundScript: isBackgroundScript,
    addOnMessageCallback: addOnMessageCallback,
    removeOnMessageCallback: removeOnMessageCallback,
    sendMessageToTab: sendMessageToTab,
    sendMessageToBackground: sendMessageToBackground,
    getURL: getURL,
    loadStorage: loadStorage,
    saveStorage: saveStorage,
    injectScriptToTab: injectScriptToTab,
    listenForTabs: listenForTabs,
    getActiveTab: getActiveTab,
    reloadTab: reloadTab,
    openOptionsPage: openOptionsPage,
    setBadgeText: setBadgeText,
    forbiddenDomains: FORBIDDEN_DOMAINS
};