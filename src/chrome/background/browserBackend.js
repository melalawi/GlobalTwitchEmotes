'use strict';


function injectScriptToTab(tab, script) {
    return new Promise(function(resolve, reject) {
        chrome.tabs.executeScript(tab.id, {file: script}, function() {
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

function sendMessageToTab(tab, message) {
    return new Promise(function(resolve, reject) {
        chrome.tabs.sendMessage(tab.id, message, function() {
            if (!chrome.runtime.lastError) {
                resolve(tab);
            }
        });
    });
}


module.exports = {
    injectScriptToTab: injectScriptToTab,
    listenForTabs: listenForTabs,
    sendMessageToTab: sendMessageToTab
};