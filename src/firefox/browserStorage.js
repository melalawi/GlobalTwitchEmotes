var settingsChangeListener;


function load() {
    return browser.storage.local.get(null);
}

function save(data) {
    return browser.storage.local.set(data);
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