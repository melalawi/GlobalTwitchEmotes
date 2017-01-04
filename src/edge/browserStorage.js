'use strict';
var settingsChangeListener;


function load() {
    return new Promise(function(resolve, reject) {
        browser.storage.local.get(null, function(data) {
            resolve(data);
        });
    });
}

function save(data) {
    return new Promise(function(resolve, reject) {
        browser.storage.local.set(data, function() {
            resolve();
        });
    });
}

function bindOnStorageChange(callbackFunction) {
    if (settingsChangeListener != undefined) {
        browser.storage.onChanged.removeListener(settingsChangeListener);
    }

    settingsChangeListener = browser.storage.onChanged.addListener(callbackFunction);
}

module.exports = {
    load: load,
    save: save,
    bindOnStorageChange: bindOnStorageChange
};