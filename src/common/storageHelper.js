var clone = require('clone');
var Dexie = require('dexie');
var unique = require('uniq');

var browser = require('./browser');


const URL_EXTRACTION_REGEX = /^(?:\w+:\/\/)?(?:www\.)?([^\s\/]+(?:\/[^\s\/]+)*)\/*$/i;
const DEFAULT_SETTINGS = {
    version: '1.3.0',

    twitchStyleTooltips: true,
    replaceYouTubeKappa: false,
    iframeInjection: false,

    unicodeEmojis: false,
    twitchSmilies: false,
    smiliesType: 'Robot',
    useMonkeySmilies: false,

    twitchGlobal: true,
    twitchChannels: true,
    bttvGlobal: false,
    bttvChannels: false,
    ffzGlobal: false,
    ffzChannels: false,
    customEmotes: false,

    twitchChannelsList: [],
    bttvChannelsList: [],
    ffzChannelsList: [],
    customEmotesList: [],

    domainFilterMode: 'Blacklist',
    domainFilterList: [],
    emoteFilterMode: 'Blacklist',
    emoteFilterList: []
};

var db;


function initialize() {
    db = new Dexie('GTE');

    db.version(1).stores({
        cache: '&set, emotes, date',
        customEmotes: '&key, url'
    });

    db.open();
}

function getCacheEntry(key) {
    return db.cache.get(key);
}

function setCacheEntry(key, emotes, date) {
    return db.cache.put({
        set: key,
        emotes: emotes,
        date: date
    });
}

function getSettings() {
    return new Promise(function(resolve, reject) {
        Promise.all([db.customEmotes.toArray(), browser.loadStorage('sync')]).then(function(data) {
            migrateSettings(data[0], data[1]).then(function(settings) {
                resolve(sanitizeSettings(settings));
            }).catch(reject);
        }).catch(reject);
    });
}

function setSettings(data) {
    return new Promise(function(resolve, reject) {
        var sync = sanitizeSettings(data);
        var local = sync.customEmotesList;

        delete sync.customEmotesList;

        db.customEmotes.clear().then(function(){
            Promise.all([db.customEmotes.bulkPut(local), browser.saveStorage(sync, 'sync')]).then(resolve).catch(reject);
        });
    });
}

function migrateSettings(customEmotesList, sync) {
    return new Promise(function(resolve, reject) {
        var settings;

        if (sync.hasOwnProperty('version') === false) {
            // Version 1.2.0 and below
            console.log('Old settings detected.');

            browser.loadStorage('local').then(function(local) {
                if (local.hasOwnProperty('emoteFilterList')) {
                    // Channel filtering has been deprecated
                    for (var i = local.emoteFilterList.length - 1; i >= 0; --i) {
                        var currentRule = local.emoteFilterList[i];

                        if (currentRule.type === 'Channel') {
                            local.emoteFilterList.splice(i, 1);
                        } else {
                            delete local.emoteFilterList[i].type;
                        }
                    }
                }

                setSettings(local).then(resolve).catch(reject);
            }).catch(reject);
        } else if (sync.version === '1.3.0') {
            settings = sync;
            settings.customEmotesList = customEmotesList;

            resolve(settings);
        } else {
            reject('Unrecognized settings version.');
        }
    });

}

function sanitizeSettings(settings) {
    var finalSettings = clone(DEFAULT_SETTINGS);

    for (var key in finalSettings) {
        if (finalSettings.hasOwnProperty(key) && settings[key] !== undefined) {
            if (typeof finalSettings[key] === 'boolean') {
                finalSettings[key] = settings[key] === true;
            } else if (Array.isArray(finalSettings[key])) {
                finalSettings[key] = filterInvalidListEntries(settings[key]);
            } else {
                finalSettings[key] = settings[key];
            }
        }
    }

    finalSettings.domainFilterList = replaceInvalidFilteredURLs(finalSettings.domainFilterList);

    return finalSettings;
}

function filterInvalidListEntries(list) {
    var result = list || [];
    var len = result.length;
    var i = -1;

    while (i++ < len) {
        var j = i + 1;

        for (; j < result.length; ++j) {
            if (listEntryComparison(result[i], result[j])) {
                result.splice(j--, 1);
            }
        }
    }

    for (var k = result.length - 1; k >= 0; --k) {
        var entry = result[k];

        if (!entry) {
            result.splice(k, 1);
        } else if (typeof entry === 'string' && !entry.trim()) {
            result.splice(k, 1);
        } else if (typeof entry === 'object') {
            if (Object.keys(entry).length === 0) {
                result.splice(k, 1);
            } else {
                for (var key in entry) {
                    if (entry.hasOwnProperty(key)) {
                        if (!entry[key]) {
                            result.splice(k, 1);
                            break;
                        }
                    }
                }
            }
        }
    }

    return result;
}

function listEntryComparison(first, second) {
    var equal = false;

    if (typeof first === typeof second) {
        equal = true;

        if (typeof first === 'object') {
            for (var key in first) {
                if (first.hasOwnProperty(key) && first[key] !== second[key]) {
                    equal = false;
                    break;
                }
            }
        } else if (typeof first === 'string') {
            equal = first.toLowerCase() === second.toLowerCase();
        } else {
            equal = first === second;
        }
    }

    return equal;
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

function doesSettingExist(settingName) {
    return DEFAULT_SETTINGS.hasOwnProperty(settingName);
}

initialize();


module.exports = {
    getCacheEntry: getCacheEntry,
    setCacheEntry: setCacheEntry,
    getSettings: getSettings,
    setSettings: setSettings,
    doesSettingExist: doesSettingExist,
    sanitizeSettings: sanitizeSettings
};