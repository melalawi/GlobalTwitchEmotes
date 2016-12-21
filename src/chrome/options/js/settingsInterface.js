'use strict';
var $ = require('jquery');
var extensionSettings = require('extensionSettings');


var SETTINGS_SELECTORS = {
    twitchStyleTooltips: '#twitchStyleTooltipsCheckbox',
    hitboxKappas: '#hitboxKappasCheckbox',

    twitchGlobal: '#twitchGlobalCheckbox',
    twitchChannels: '#twitchChannelsCheckbox',
    bttvGlobal: '#bttvGlobalCheckbox',
    bttvChannels: '#bttvChannelsCheckbox',
    ffzGlobal: '#ffzGlobalCheckbox',
    ffzChannels: '#ffzChannelsCheckbox',
    customEmotes: '#customEmotesCheckbox',

    bttvChannelList: '#bttvChannelList',
    ffzChannelList: '#ffzChannelList',
    customEmotesList: '#customEmotesList',

    domainFilterMode: '[name="domainFilterMode"]',
    domainFilterList: '#domainFilterList',
    emoteFilterMode: '[name="emoteFilterMode"]',
    emoteFilterList: '#emoteFilterList'
};


function loadSettingsToPage() {
    return extensionSettings.getSettings().then(function(data) {
        for (var key in SETTINGS_SELECTORS) {
            if (SETTINGS_SELECTORS.hasOwnProperty(key)) {
                var $settingDOMElement = $(SETTINGS_SELECTORS[key]);
                var settingValue = data[key];

                if ($settingDOMElement.attr('type') === 'checkbox') {
                    $settingDOMElement.prop('checked', settingValue === true);
                } else if ($settingDOMElement.eq(0).attr('type') === 'radio') {
                    $settingDOMElement.filter('[value=' + settingValue + ']').prop('checked', true);
                } else if ($settingDOMElement.is('table')) {
                    setTableEntries($settingDOMElement, settingValue);
                }
            }
        }
    });
}

function saveSettingsToStorage() {
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

    return extensionSettings.setSettings(pageSettings);
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
    loadSettingsToPage: loadSettingsToPage,
    saveSettingsToStorage: saveSettingsToStorage
};