var $ = require('jquery');
var browser = require('browser');
var storageHelper = require('storageHelper');


const SETTINGS_SELECTORS = {
    twitchStyleTooltips: '#twitchStyleTooltipsCheckbox',
    replaceYouTubeKappa: '#replaceYouTubeKappaCheckbox',
    iframeInjection: '#iframeInjectionCheckbox',

    unicodeEmojis: '#unicodeEmojisCheckbox',
    twitchSmilies: '#twitchSmiliesCheckbox',
    smiliesType: '[name="smiliesType"]',
    useMonkeySmilies: '#useMonkeySmiliesCheckbox',

    twitchGlobal: '#twitchGlobalCheckbox',
    twitchChannels: '#twitchChannelsCheckbox',
    bttvGlobal: '#bttvGlobalCheckbox',
    bttvChannels: '#bttvChannelsCheckbox',
    ffzGlobal: '#ffzGlobalCheckbox',
    ffzChannels: '#ffzChannelsCheckbox',
    customEmotes: '#customEmotesCheckbox',

    twitchChannelsList: '#twitchChannelsList',
    bttvChannelsList: '#bttvChannelsList',
    ffzChannelsList: '#ffzChannelsList',
    customEmotesList: '#customEmotesList',

    domainFilterMode: '[name="domainFilterMode"]',
    domainFilterList: '#domainFilterList',
    emoteFilterMode: '[name="emoteFilterMode"]',
    emoteFilterList: '#emoteFilterList'
};

var client = new browser.MessageClient(false);

function getPageSettings(sanitize) {
    var pageSettings = {};

    for (var key in SETTINGS_SELECTORS) {
        if (SETTINGS_SELECTORS.hasOwnProperty(key)) {
            var $settingDOMElement = $(SETTINGS_SELECTORS[key]);

            if ($settingDOMElement.attr('type') === 'checkbox') {
                pageSettings[key] = $settingDOMElement.prop('checked') === true;
            } else if ($settingDOMElement.eq(0).attr('type') === 'radio') {
                pageSettings[key] = $settingDOMElement.filter(':checked').val();
            } else if ($settingDOMElement.is('table')) {
                pageSettings[key] = getTableEntries($settingDOMElement);
            }
        }
    }

    return sanitize === true ? storageHelper.sanitizeSettings(pageSettings) : pageSettings;
}

function setPageSettings(settings) {
    for (var key in SETTINGS_SELECTORS) {
        if (SETTINGS_SELECTORS.hasOwnProperty(key)) {
            var $settingDOMElement = $(SETTINGS_SELECTORS[key]);
            var settingValue = settings[key];

            if ($settingDOMElement.attr('type') === 'checkbox') {
                $settingDOMElement.prop('checked', settingValue === true);
            } else if ($settingDOMElement.eq(0).attr('type') === 'radio') {
                $settingDOMElement.filter('[value=' + settingValue + ']').prop('checked', true);
            } else if ($settingDOMElement.is('table')) {
                setTableEntries($settingDOMElement, settingValue);
            }
        }
    }
}

function loadStoredSettingsToPage() {
    return storageHelper.getSettings().then(setPageSettings);
}

function savePageSettingsToStorage() {
    return storageHelper.setSettings(getPageSettings()).then(notifyBackgroundOnSettingsChange);
}

function notifyBackgroundOnSettingsChange() {
    client.messageBackground({
        header: 'triggerSettingsChange'
    });
}

function setTableEntries($table, entries) {
    var tableOptions = $table.EditableTable('getOptions');
    var importableData = [];

    for (var i = 0; i < entries.length; ++i) {
        var nextEntry = {};

        if (typeof entries[i] !== 'object') {
            nextEntry[tableOptions.columns[0].name] = entries[i];
        } else {
            nextEntry = entries[i];
        }

        importableData.push(nextEntry);
    }

    $table.EditableTable('importData', importableData);
}

function getTableEntries($table) {
    var tableOptions = $table.EditableTable('getOptions');
    var tableData = $table.EditableTable('exportData');
    var results = [];

    for (var i = 0; i < tableData.length; ++i) {
        if (tableOptions.columns.length === 1) {
            results.push(tableData[i][tableOptions.columns[0].name]);
        } else {
            results.push(tableData[i]);
        }
    }

    return results;
}


module.exports = {
    loadStoredSettingsToPage: loadStoredSettingsToPage,
    savePageSettingsToStorage: savePageSettingsToStorage,
    setPageSettings: setPageSettings,
    getPageSettings: getPageSettings
};