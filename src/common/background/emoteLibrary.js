var extend = require('extend');
var EmoteLookup = require('./emoteLookup');
var twitchSmilies = require('./twitchSmilies');
var customEmotes = require('./customEmotes');


var HOSTS = {
    bttvChannels: require('./hosts/bttvChannels'),
    bttvGlobal: require('./hosts/bttvGlobal'),
    ffzChannels: require('./hosts/ffzChannels'),
    ffzGlobal: require('./hosts/ffzGlobal'),
    twitchChannels: require('./hosts/twitchChannels'),
    twitchGlobal: require('./hosts/twitchGlobal')
};
var FILTER_TO_HOST_MAPPING = {
    'Twitch.tv': ['twitchGlobal', 'twitchChannels'],
    BetterTTV: ['bttvGlobal', 'bttvChannels'],
    FrankerFaceZ: ['ffzGlobal', 'ffzChannels']
};
var cachedEmotes = null;
var ready = false;
var userSettings = {};


function updateEmoteLibrary(settings) {
    var libraryPromise;
    var promises = [];

    cachedEmotes = cachedEmotes || {};

    resetFilterRules();

    userSettings = settings;

    removeUnwantedEmotes();
    for (var host in HOSTS) {
        if (HOSTS.hasOwnProperty(host) && userSettings[host] === true) {
            promises.push.apply(promises, retrieveEmotes(host));
        }
    }

    delete cachedEmotes.twitchSmilies;
    if (userSettings.twitchSmilies) {
        promises.push(updateTwitchSmilies());
    }

    delete cachedEmotes.customEmotes;
    if (userSettings.customEmotes) {
        promises.push(updateCustomEmotes());
    }

    libraryPromise = Promise.all(promises);

    libraryPromise.then(function() {
        for (var key in cachedEmotes) {
            if (cachedEmotes.hasOwnProperty(key)) {
                applyFilterRulesToSet(key, cachedEmotes[key]);
            }
        }

        ready = true;
    });

    return libraryPromise;
}

function updateTwitchSmilies() {
    return new Promise(function(resolve) {
        twitchSmilies.build(userSettings.smiliesType, userSettings.useMonkeySmilies).then(function(emotes) {
            addEmotes({
                setName: 'twitchSmilies',
                emoteSet: emotes
            });

            resolve();
        });
    });
}

function updateCustomEmotes() {
    return new Promise(function(resolve) {
        customEmotes.build(userSettings.customEmotesList).then(function(emotes) {
            addEmotes({
                setName: 'customEmotes',
                emoteSet: emotes
            });

            resolve();
        });
    });
}

function retrieveEmotes(host) {
    var promises = [];
    var lookup;

    if (HOSTS[host].requiresChannel === true) {
        var channelList = userSettings[host + 'List'];

        for (var i = 0; i < channelList.length; ++i) {
            var nextChannel = channelList[i].toLowerCase();

            if (cachedEmotes.hasOwnProperty(host + '_' + nextChannel) === false) {
                lookup = new EmoteLookup(HOSTS[host], nextChannel, addEmotes);

                promises.push(lookup.retrieveEmotes().then(addEmotes));
            }
        }
    } else {
        if (cachedEmotes.hasOwnProperty(host) === false) {
            lookup = new EmoteLookup(HOSTS[host], '', addEmotes);

            promises.push(lookup.retrieveEmotes().then(addEmotes));
        }
    }

    return promises;
}

function removeUnwantedEmotes() {
    for (var key in cachedEmotes) {
        if (cachedEmotes.hasOwnProperty(key)) {
            var separatorIndex = key.indexOf('_');
            var hostName = key.substr(0, separatorIndex === -1 ? key.length : separatorIndex);
            var channelName = key.substr(separatorIndex + 1, separatorIndex === -1 ? 0 : key.length);

            channelName = channelName.toLowerCase();

            if (userSettings[hostName] === false) {
                delete cachedEmotes[key];
            } else if (channelName !== '') {
                if (userSettings[hostName + 'List'].indexOf(channelName) === -1) {
                    delete cachedEmotes[key];
                }
            }
        }
    }
}

function addEmotes(emoteData) {
    if (emoteData) {
        var extendedSet = {};

        extendedSet[emoteData.setName] = emoteData.emoteSet;

        // "Late" emotes that are eventually retrieved need to be properly filtered
        if (ready === true) {
            applyFilterRulesToSet(emoteData.setName, emoteData.emoteSet);
        }

        extend(true, cachedEmotes, extendedSet);
    }
}

function resetFilterRules() {
    userSettings.emoteFilterList = userSettings.emoteFilterList || [];

    for (var key in cachedEmotes) {
        if (cachedEmotes.hasOwnProperty(key)) {
            applyFilterRulesToSet(key, cachedEmotes[key], true);
        }
    }
}

function applyFilterRulesToSet(name, emoteSet, resetRulesBoolean) {
    var separatorIndex = name.indexOf('_');
    var hostName = name.substr(0, separatorIndex === -1 ? name.length : separatorIndex);

    for (var i = 0; i < userSettings.emoteFilterList.length; ++i) {
        var rule = userSettings.emoteFilterList[i];

        // Rule pertains to provided set
        if (FILTER_TO_HOST_MAPPING[rule.set].indexOf(hostName) !== -1) {
            if (rule.type === 'Emote') {
                if (emoteSet.hasOwnProperty(rule.value)) {
                    if (resetRulesBoolean) {
                        delete emoteSet[rule.value].filtered;
                    } else {
                        emoteSet[rule.value].filtered = true;
                    }
                }
            } else if (rule.type === 'Channel') {
                for (var emoteKey in emoteSet) {
                    if (emoteSet.hasOwnProperty(emoteKey)) {
                        var emote = emoteSet[emoteKey];

                        if (emote.channel === rule.value) {
                            if (resetRulesBoolean) {
                                delete emote.filtered;
                            } else {
                                emote.filtered = true;
                            }
                        }
                    }
                }
            }
        }
    }
}

function getEmotes() {
    if (!ready) {
        throw 'Attempt to retrieve emotes before caching';
    }

    return cachedEmotes;
}


module.exports = {
    update: updateEmoteLibrary,
    getEmotes: getEmotes
};