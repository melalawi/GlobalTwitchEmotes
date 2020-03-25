var httpRequest = require('./httpRequest');
var storageHelper = require('storageHelper');


const CACHE_REFRESH_INTERVAL = 1000 * 60 * 60 * 24 * 14;
const EMOTE_REFRESH_INTERVAL = 1000 * 60 * 30;
const EMOTE_SETS = {
    bttvChannels: require('./emoteSets/bttvChannels'),
    bttvGlobal: require('./emoteSets/bttvGlobal'),
    ffzChannels: require('./emoteSets/ffzChannels'),
    ffzGlobal: require('./emoteSets/ffzGlobal'),
    twitchChannels: require('./emoteSets/twitchChannels'),
    twitchGlobal: require('./emoteSets/twitchGlobal'),
    twitchSmilies: require('./emoteSets/twitchSmilies'),
    unicodeEmojis: require('./emoteSets/unicodeEmojis'),
    customEmotes: require('./emoteSets/customEmotes')
};

var emoteRefreshTimeout;
var onAllEmotesReadyCallbacks = [];

var cachedEmotes = {};
var generatedEmotes = {};
var settings;
var emotesReady = false;


function initialize(importedSettings) {
    clearTimeout(emoteRefreshTimeout);
    emotesReady = false;
    generatedEmotes = {};

    settings = importedSettings;

    return loadAllEmotes();
}

function loadAllEmotes() {
    return new Promise(function(resolve) {
        var promises = [];
        var subscriberEmotePromises = [];

        if (settings.twitchGlobal) {
            promises.push(generateEmoteSet('twitchGlobal', EMOTE_SETS.twitchGlobal.getURL()).then(function() {
                generatedEmotes.twitchGlobal = cachedEmotes.twitchGlobal;
            }));
        }

        if (settings.twitchChannels && settings.twitchChannelsList.length > 0) {
            promises.push(new Promise(function(resolve, reject) {
                subscriberEmotePromises.push(new Promise(function(innerResolve) {
                    for (var i = 0; i < settings.twitchChannelsList.length; ++i) {
                        var channel = settings.twitchChannelsList[i].toLowerCase();

                        subscriberEmotePromises.push(fetchSubscriberEmotes('twitchChannels:' + channel, channel));
                    }

                    innerResolve();
                }));
                
                Promise.all(subscriberEmotePromises.map(reflect)).then(resolve).catch(reject);
            }));
        }

        if (settings.bttvGlobal) {
            promises.push(generateEmoteSet('bttvGlobal', EMOTE_SETS.bttvGlobal.getURL()).then(function() {
                generatedEmotes.bttvGlobal = cachedEmotes.bttvGlobal;
            }));
        }

        if (settings.bttvChannels) {
            promises.push(new Promise(function(resolve, reject) {
                for (var i = 0; i < settings.bttvChannelsList.length; ++i) {
                    var channel = settings.bttvChannelsList[i].toLowerCase();

                    promises.push(generateEmoteSet('bttvChannels:' + channel, EMOTE_SETS.bttvChannels.getURL(channel)).then(function(setName) {
                        generatedEmotes[setName] = cachedEmotes[setName];
                    }).catch(reject));
                }

                resolve();
            }));
        }

        if (settings.ffzGlobal) {
            promises.push(generateEmoteSet('ffzGlobal', EMOTE_SETS.ffzGlobal.getURL()).then(function() {
                generatedEmotes.ffzGlobal = cachedEmotes.ffzGlobal;
            }));
        }

        if (settings.ffzChannels) {
            promises.push(new Promise(function(resolve, reject) {
                for (var i = 0; i < settings.ffzChannelsList.length; ++i) {
                    var channel = settings.ffzChannelsList[i].toLowerCase();

                    promises.push(generateEmoteSet('ffzChannels:' + channel, EMOTE_SETS.ffzChannels.getURL(channel)).then(function(setName) {
                        generatedEmotes[setName] = cachedEmotes[setName];
                    }).catch(reject));
                }

                resolve();
            }));
        }

        if (settings.unicodeEmojis) {
            promises.push(httpRequest.get(EMOTE_SETS.unicodeEmojis.getURL()).then(function(responseJSON) {
                var unicodeEmojis =  {
                    set: 'unicodeEmojis',
                    emotes: EMOTE_SETS.unicodeEmojis.parseEmotes(responseJSON)
                };

                cachedEmotes.unicodeEmojis = unicodeEmojis;
                generatedEmotes.unicodeEmojis = unicodeEmojis;

                console.log('Loaded Unicode emojis.');
            }));
        }

        if (settings.twitchSmilies) {
            promises.push(httpRequest.get(EMOTE_SETS.twitchSmilies.getURL()).then(function(responseJSON) {
                var twitchSmilies =  {
                    set: 'twitchSmilies',
                    emotes: EMOTE_SETS.twitchSmilies.parseEmotes(responseJSON, settings.smiliesType, settings.useMonkeySmilies)
                };

                cachedEmotes.twitchSmilies = twitchSmilies;
                generatedEmotes.twitchSmilies = twitchSmilies;

                console.log('Loaded Twitch "' + settings.smiliesType + '" smilies emotes ' + (settings.useMonkeySmilies === true ? 'with' : 'without') + ' Monkey overrides.');
            }));
        }

        if (settings.customEmotes && settings.customEmotesList.length > 0) {
            var customEmotes =  {
                set: 'customEmotes',
                emotes: EMOTE_SETS.customEmotes.parseEmotes(settings.customEmotesList)
            };

            cachedEmotes.customEmotes = customEmotes;
            generatedEmotes.customEmotes = customEmotes;

            console.log('Loaded custom emotes.');
        }

        // Run GTE with the emotes that managed to succeed
        Promise.all(promises.map(reflect))
        .then(function() {
            onReady();

            resolve();
        }).catch(function(error) {
            console.error(error);
        });
    });
}

function reflect(promise){
    return promise.then(function(v) {
        return {
            v: v,
            status: 'resolved'
        }
    },
    function(e) {
        return {
            e: e,
            status: 'rejected'
        }
    });
}

function generateEmoteSet(set, url) {
    return new Promise(function(resolve, reject) {
        retrieveCachedEmotes(set).then(resolve).catch(function(set) {
            fetchAndCacheEmotesFromServer(set, url).then(resolve).catch(reject);
        });
    });
}

function retrieveCachedEmotes(set) {
    return new Promise(function(resolve, reject) {
        storageHelper.getCacheEntry(set).then(function(cachedEntry) {
            if (!cachedEntry) {
                console.log('Cached copy of "' + set + '" NOT found.');

                reject(set);
            } else {
                cachedEmotes[set] = cachedEntry;

                if ((Date.now() - cachedEntry.date) <= CACHE_REFRESH_INTERVAL) {
                    console.log('Recently cached copy of "' + set + '" emotes found.');

                    resolve(set);
                } else {
                    console.log('Cached copy of "' + set + '" found but are over two weeks old.');

                    reject(set);
                }
            }
        }).catch(function() {
            console.error('Error when attempting to retrieve cache of "' + set + '".');

            reject(set);
        });
    });
}

function getChannelFromSet(set) {
    return set.indexOf(':') !== -1 ? set.substr(set.indexOf(':') + 1) : set;
}

function fetchSubscriberEmotes(set, channel) {
    return new Promise(function(resolve, reject) {
        retrieveCachedEmotes(set).then(function() {
            generatedEmotes[set] = cachedEmotes[set];

            resolve();
        }).catch(function() {
            EMOTE_SETS.twitchChannels.getChannelIdFromName(channel).then(function(channel_id) {
                generateEmoteSet(set, EMOTE_SETS.twitchChannels.getURL(channel_id)).then(function() {
                    generatedEmotes[set] = cachedEmotes[set];
                    resolve();
                }).catch(reject);
            }).catch(reject);
        });
    });
}

function fetchAndCacheEmotesFromServer(set, url) {
    return new Promise(function(resolve, reject) {
        console.log('Retrieving "' + set + '" from server...');

        httpRequest.get(url).then(function(responseJSON) {
            // Remove colon postfix to use correct emote parser
            var parserModule = set.indexOf(':') !== -1 ? set.substr(0, set.indexOf(':')) : set;

            var emotes = {
                emotes: EMOTE_SETS[parserModule].parseEmotes(responseJSON),
                date: Date.now()
            };

            console.log('Successfully retrieved "' + set + '" from server. Caching...');

            cachedEmotes[set] = emotes;

            storageHelper.setCacheEntry(set, emotes.emotes, emotes.date).then(function() {
                console.log('Cached copy of "' + set + '" successfully.');
            });

            resolve(set);
        }).catch(function(error) {
            console.error('Failed to retrieve "' + set + '" from ' + url + ' - ' + error);

            reject(set);
        });
    });
}

function onReady() {
    emoteRefreshTimeout = setTimeout(loadAllEmotes, EMOTE_REFRESH_INTERVAL);

    emotesReady = true;

    for (var i = 0; i < onAllEmotesReadyCallbacks.length; ++i) {
        onAllEmotesReadyCallbacks[i]();
    }

    onAllEmotesReadyCallbacks = [];
}

function addAllEmotesReadyCallback(callback) {
    if (emotesReady === true) {
        callback();
    } else {
        if (onAllEmotesReadyCallbacks.indexOf(callback) === -1) {
            onAllEmotesReadyCallbacks.push(callback);
        }
    }
}

function getEmoteSets() {
    return Object.keys(generatedEmotes);
}

function getEmotes(set) {
    return generatedEmotes[set];
}

function getAllEmotes() {
    return generatedEmotes;
}

function isReady() {
    return emotesReady;
}

module.exports = {
    initialize: initialize,
    onAllEmotesReady: addAllEmotesReadyCallback,
    getEmotes: getEmotes,
    getEmoteSets: getEmoteSets,
    getAllEmotes: getAllEmotes,
    isReady: isReady
};