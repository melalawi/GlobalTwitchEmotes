const FORBIDDEN_DOMAINS = [
    'chrome.google.com'
];

var settingsChangeListener = null;
var tabListener = null;
var installListener = null;


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

function onStorageChange(callbackFunction) {
    if (settingsChangeListener !== null) {
        chrome.storage.onChanged.removeListener(settingsChangeListener);
    }

    settingsChangeListener = chrome.storage.onChanged.addListener(callbackFunction);
}

function injectScriptToTab(script, tab, allFrames) {
    return new Promise(function(resolve, reject) {
        chrome.tabs.executeScript(tab.id, {
            file: script,
            runAt: allFrames === true ? 'document_idle' : 'document_start',
            allFrames: allFrames
        }, function() {
            if (!chrome.runtime.lastError) {
                resolve(tab);
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

    chrome.browserAction.setBadgeBackgroundColor({
        color: backgroundColor,
        tabId: tab.id
    });

    chrome.browserAction.setBadgeText({
        text: text,
        tabId: tab.id
    });
}

function onExtensionInstall(callback) {
    if (installListener) {
        chrome.extension.onMessage.removeListener(installListener);
    }

    installListener = chrome.runtime.onInstalled.addListener(callback);
}

function getURL(url) {
    return chrome.extension.getURL(url);
}

function MessageClient(autoSendResponse) {
    var messageReceivedCallback = null;
    var automaticallyRespond = autoSendResponse === true;

    // Set callbacks before listening
    this.listen = function(callback) {
        messageReceivedCallback = callback;

        chrome.runtime.onMessage.removeListener(onMessage);
        chrome.runtime.onMessage.addListener(onMessage);
    };

    this.stopListening = function() {
        chrome.runtime.onMessage.removeListener(onMessage);
    };

    this.messageTab = function(tab, message) {
        chrome.tabs.sendMessage(tab.id, message, onResponse);
    };

    this.messageBackground = function(message) {
        chrome.runtime.sendMessage(message, onResponse);
    };

    function onResponse(response) {
        if (automaticallyRespond === false && messageReceivedCallback) {
            messageReceivedCallback(response);
        }

        console.log('Ack');
    }

    function onMessage(message, sender, responseCallback) {
        if (automaticallyRespond === true) {
            // Run callback to prevent port exception
            responseCallback();

            if (messageReceivedCallback) {
                messageReceivedCallback(message);
            }
        } else {
            if (messageReceivedCallback) {
                messageReceivedCallback(message, responseCallback, sender.tab);
            }
        }

        return true;
    }
}

module.exports = {
    MessageClient: MessageClient,
    getURL: getURL,
    loadStorage: loadStorage,
    saveStorage: saveStorage,
    bindCallbackToStorageChange: onStorageChange,
    injectScriptToTab: injectScriptToTab,
    listenForTabs: listenForTabs,
    getActiveTab: getActiveTab,
    reloadTab: reloadTab,
    openOptionsPage: openOptionsPage,
    setBadgeText: setBadgeText,
    onExtensionInstall: onExtensionInstall,
    forbiddenDomains: FORBIDDEN_DOMAINS
};