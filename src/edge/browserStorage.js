var settingsChangeListener;


function load() {
    return new Promise(function(resolve) {
        browser.storage.local.get(null, function(data) {
            resolve(data);
        });
    });
}

function save(data) {
    return new Promise(function(resolve) {
        browser.storage.local.set(data, function() {
            resolve();
        });
    });
}

function bindOnStorageChange(callbackFunction) {
    if (settingsChangeListener) {
        browser.storage.onChanged.removeListener(settingsChangeListener);
    }

    settingsChangeListener = browser.storage.onChanged.addListener(callbackFunction);
}

module.exports = {
    load: load,
    save: save,
    bindOnStorageChange: bindOnStorageChange
};