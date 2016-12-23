'use strict';
var clone = require('clone');
var extend = require('extend');
var unique = require('uniq');
var browserStorage = require('./browserStorage');


var URL_EXTRACTION_REGEX = /^(?:\w+:\/\/)?(?:www\.)?([^\s\/]+(?:\/[^\s\/]+)*)\/*$/i;
var DEFAULT_SETTINGS = {
    twitchStyleTooltips: true,
    hitboxKappas: true,

    twitchGlobal: true,
    twitchChannels: true,
    bttvGlobal: true,
    bttvChannels: true,
    ffzGlobal: true,
    ffzChannels: true,
    customEmotes: false,

    bttvChannelsList: [],
    ffzChannelsList: [],
    customEmotesList: [],

    domainFilterMode: 'Blacklist',
    domainFilterList: [],
    emoteFilterMode: 'Blacklist',
    emoteFilterList: []
};


function getSettings() {
    return new Promise(function(resolve, reject) {
        browserStorage.load().then(function(data) {
            resolve(extendSettings(data));
        }).catch(function() {
            resolve(extendSettings({}));
        });
    });
}

function setSettings(data) {
    return new Promise(function(resolve, reject) {
        browserStorage.save(extendSettings(data)).then(function() {
            resolve();
        }).catch(function() {
            reject();
        });
    });
}

function extendSettings(settings) {
    var finalSettings = clone(DEFAULT_SETTINGS);

    for (var key in finalSettings) {
        if (finalSettings.hasOwnProperty(key) && settings[key] !== undefined) {
            if (typeof finalSettings[key] === 'boolean') {
                finalSettings[key] = settings[key] === true;
            } else if (Array.isArray(finalSettings[key])) {
                finalSettings[key] = filterInvalidListEntries(settings[key]);
            } else {
                finalSettings[key] = settings[key] === 'Whitelist' ? 'Whitelist' : 'Blacklist';
            }
        }
    }

    finalSettings.domainFilterList = replaceInvalidFilteredURLs(finalSettings.domainFilterList);

    return finalSettings;
}

function filterInvalidListEntries(list) {
    var result = list || [];

    for (var i = result.length - 1; i >= 0; --i) {
        var entry = result[i];

        if (!entry) {
            result.splice(i, 1);
        } else if (typeof entry === 'string' && !entry.trim()) {
            result.splice(i, 1);
        } else if (typeof entry === 'object') {
            for (var key in entry) {
                if (entry.hasOwnProperty(key)) {
                    if (!entry[key]) {
                        result.splice(i, 1);
                        break;
                    }
                }
            }
        }
    }

    unique(list, function(first, second) {
        var equal = -1;

        if (typeof first === typeof second) {
            equal = 0;

            if (typeof first === 'object') {
                for (var key in first) {
                    if (first.hasOwnProperty(key) && first[key] != second[key]) {
                        equal = -1;
                        break;
                    }
                }
            } else if (typeof first === 'string') {
                equal = first.toLowerCase() === second.toLowerCase() ? 0 : -1;
            } else {
                equal = first === second ? 0 : -1;
            }
        }

        return equal;
    });

    return result;
}

function replaceInvalidFilteredURLs(urlList) {
    var result = [];

    for (var i = 0; i < urlList.length; ++i) {
        var isURL = URL_EXTRACTION_REGEX.test(urlList[i]);

        if (isURL) {
            result.push(URL_EXTRACTION_REGEX.exec(urlList[i])[1]);
        }
    }

    return result;
}

function bindEventToSettingsChange(callback) {
    browserStorage.bindOnStorageChange(function(changes) {
        callback(changes);
    });
}

function doesSettingExist(settingName) {
    return DEFAULT_SETTINGS.hasOwnProperty(settingName);
}


module.exports = {
    getSettings: getSettings,
    setSettings: setSettings,
    onSettingsChange: bindEventToSettingsChange,
    doesSettingExist: doesSettingExist
};