'use strict';
var settingsChangeListener;


function load() {
    return new Promise(function(resolve, reject) {
        chrome.storage.local.get(null, function(data) {
            if (chrome.runtime.lastError) {
                console.error('Chrome Storage Error', chrome.runtime.lastError.message);

                reject(chrome.runtime.lastError.message);
            }

            resolve(data);
        });
    });
}

function save(data) {
    return new Promise(function(resolve, reject) {
        chrome.storage.local.set(data, function() {
            if (chrome.runtime.lastError) {
                console.error('Chrome Storage Error', chrome.runtime.lastError.message);

                reject(chrome.runtime.lastError.message);
            } else {
                resolve();
            }
        });
    });
}

function bindOnStorageChange(callbackFunction) {
    if (settingsChangeListener != undefined) {
        chrome.storage.onChanged.removeListener(settingsChangeListener);
    }

    settingsChangeListener = chrome.storage.onChanged.addListener(callbackFunction);
}

module.exports = {
    load: load,
    save: save,
    bindOnStorageChange: bindOnStorageChange
};