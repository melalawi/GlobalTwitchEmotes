'use strict';
var clone = require('clone');
var extend = require('extend');


var DEFAULT_SETTINGS = {
    twitchGlobal: true,
    twitchChannels: true,
    bttvGlobal: true,
    bttvChannels: true,
    ffzGlobal: true,
    ffzChannels: true,
    customEmotes: true, // TODO false
    bttvChannelList: ['insentience', 'ph34rm3333'],
    ffzChannelList: ['insentience', 'ph34rm3333'],
    customEmotesList: [
        {
            key: 'mog',
            url: 'http://agora.rpgclassics.com/images/smilies/moogle.gif'
        }
    ],
    domainFilterList: [],
    domainFilterMode: 'Blacklist',
    emoteFilterList: [
        {
            host: 'twitchChannels',
            channel: 'goodguygarry',
            key: 'ggg1'
        }
    ],
    emoteFilterMode: 'Blacklist'
};
var cachedSettings = null;


function chromeLoad() {
    return new Promise(function(resolve, reject) {
        if (cachedSettings !== null) {
            resolve(clone(cachedSettings));
        } else {
            chrome.storage.sync.get(null, function(data) {
                if (chrome.runtime.lastError) {
                    console.error('Chrome Storage Error', chrome.runtime.lastError.message);

                    reject(chrome.runtime.lastError.message);
                }

                cachedSettings = extendSettings(data);
                resolve(clone(cachedSettings));
            });
        }
    });
}

function chromeSave(data) {
    cachedSettings = extendSettings(data);

    return new Promise(function(resolve, reject) {
        chrome.storage.sync.set(cachedSettings, function() {
            if (chrome.runtime.lastError) {
                console.error('Chrome Storage Error', chrome.runtime.lastError.message);

                reject(chrome.runtime.lastError.message);
            } else {
                resolve(clone(cachedSettings));
            }
        });
    });
}

function extendSettings(settings) {
    var finalSettings = clone(DEFAULT_SETTINGS);

    extend(finalSettings, settings);

    for (var key in finalSettings) {
        if (DEFAULT_SETTINGS.hasOwnProperty(key) == false) {
            delete finalSettings[key];
        }
    }

    return finalSettings;
}

module.exports = {
    getSettings: chromeLoad,
    setSettings: chromeSave
};