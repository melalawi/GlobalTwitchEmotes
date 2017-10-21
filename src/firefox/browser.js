const FORBIDDEN_DOMAINS = [
    'addons.mozilla.org'
];

var settingsChangeListener = null;
var tabListener = null;
var installListener = null;


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

function onExtensionInstall(callback) {
    if (installListener) {
        browser.runtime.onInstalled.removeListener(installListener);
    }

    installListener = browser.runtime.onInstalled.addListener(callback);
}

function getURL(url) {
    return browser.extension.getURL(url);
}

function MessageClient(autoSendResponse) {
    var messageReceivedCallback = null;
    var automaticallyRespond = autoSendResponse === true;

    // Set callbacks before listening
    this.listen = function(callback) {
        messageReceivedCallback = callback;

        browser.runtime.onMessage.removeListener(onMessage);
        browser.runtime.onMessage.addListener(onMessage);
    };

    this.stopListening = function() {
        browser.runtime.onMessage.removeListener(onMessage);
    };

    this.messageTab = function(tab, message) {
        browser.tabs.sendMessage(tab.id, message).then(onResponse);
    };

    this.messageBackground = function(message) {
        browser.runtime.sendMessage(message).then(onResponse);
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
    injectScriptToTab: injectScriptToTab,
    listenForTabs: listenForTabs,
    getActiveTab: getActiveTab,
    reloadTab: reloadTab,
    openOptionsPage: openOptionsPage,
    setBadgeText: setBadgeText,
    onExtensionInstall: onExtensionInstall,
    forbiddenDomains: FORBIDDEN_DOMAINS
};