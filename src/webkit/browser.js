const FORBIDDEN_DOMAINS = [
    'chrome.google.com'
];

var tabListener = null;

function addOnMessageCallback(callback) {
    chrome.runtime.onMessage.removeListener(callback);
    chrome.runtime.onMessage.addListener(callback);
}

function removeOnMessageCallback(callback) {
    chrome.runtime.onMessage.removeListener(callback);
}

function sendMessageToTab(tab, message, onResponseCallback) {
    chrome.tabs.sendMessage(tab.id, message, onResponseCallback);
}

function sendMessageToBackground(message, onResponseCallback) {
    chrome.runtime.sendMessage(message, onResponseCallback);
}

function loadStorage(storageType) {
    return new Promise(function(resolve, reject) {
        chrome.storage[storageType].get(null, function(data) {
            if (chrome.runtime.lastError) {
                console.error('Chrome Storage Error', chrome.runtime.lastError.message);

                reject(chrome.runtime.lastError.message);
            }

            resolve(data);
        });
    });
}

function saveStorage(data, storageType) {
    return new Promise(function(resolve, reject) {
        chrome.storage[storageType].set(data, function() {
            if (!chrome.runtime.lastError) {
                resolve();
            } else {
                console.error('Chrome Storage Error', chrome.runtime.lastError.message);

                reject(chrome.runtime.lastError.message);
            }
        });
    });
}

function injectScriptToTab(script, tab, allFrames) {
    return new Promise(function(resolve, reject) {
        chrome.scripting.executeScript({
            target: {
                tabId: tab.id,
                allFrames: allFrames === true
            },
            files: [script]
        }, function() {
            if (!chrome.runtime.lastError) {
                resolve();
            } else {
                console.error(chrome.runtime.lastError);

                reject(chrome.runtime.lastError);
            }
        });
    });
}

function listenForTabs(callback) {
    if (tabListener !== null) {
        chrome.tabs.onUpdated.removeListener(tabListener);
    }

    tabListener = function(tabID, changeInfo, tab) {
        if (changeInfo.status === 'complete') {
            callback(tab);
        }
    };

    chrome.tabs.onUpdated.addListener(tabListener);
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

function reloadTab(tab) {
    return new Promise(function(resolve) {
        chrome.tabs.reload(tab.id, resolve);
    });
}

function openOptionsPage() {
    chrome.runtime.openOptionsPage();
}

function setBadgeText(tab, string, backgroundColor) {
    var text = string.length > 4 ? '∞' : string;

    chrome.action.setBadgeBackgroundColor({
        color: backgroundColor,
        tabId: tab.id
    });

    chrome.action.setBadgeText({
        text: text,
        tabId: tab.id
    });
}

function getURL(url) {
    return chrome.runtime.getURL(url);
}

module.exports = {
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
