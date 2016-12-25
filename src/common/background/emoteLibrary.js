'use strict';
var twitchSmilies = require('./hosts/twitchSmilies');


var HOSTS = {
    bttvChannels: require('./hosts/bttvChannels'),
    bttvGlobal: require('./hosts/bttvGlobal'),
    customEmotes: require('./hosts/customEmotes'),
    ffzChannels: require('./hosts/ffzChannels'),
    ffzGlobal: require('./hosts/ffzGlobal'),
    twitchChannels: require('./hosts/twitchChannels'),
    twitchGlobal: require('./hosts/twitchGlobal')
};
var FILTER_TO_HOST_MAPPING = {
    'Twitch.tv': {
        global: 'twitchGlobal',
        channels: 'twitchChannels'
    },
    BetterTTV: {
        global: 'bttvGlobal',
        channels: 'bttvChannels'
    },
    FrankerFaceZ: {
        global: 'ffzGlobal',
        channels: 'ffzChannels'
    }
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

    for (var host in HOSTS) {
        if (HOSTS.hasOwnProperty(host)) {
            // Saved emotes for this particular host exist
            if (cachedEmotes[host] != null) {
                // Get rid of them if the user doesn't want them anymore
                if (settings[host] === false) {
                    delete cachedEmotes[host];
                } else {
                    // Adding more bttv/ffz channels without changing host preferences should be handled more gracefully
                    if (HOSTS[host].requiresChannelList === true) {
                        promises.push(getHostEmotes(host));
                    }
                }
            } else {
                // No saved emotes for this host found, and the user desires them
                if (settings[host] === true) {
                    promises.push(getHostEmotes(host));
                }
            }
        }
    }

    delete cachedEmotes['twitchSmilies'];
    if (userSettings.twitchSmilies) {
        promises.push(updateTwitchSmilies());
    }

    libraryPromise = Promise.all(promises);

    libraryPromise.then(function() {
        applyFilterRules();

        ready = true;
    });

    return libraryPromise;
}

function updateTwitchSmilies() {
    return new Promise(function(resolve, reject) {
        twitchSmilies.build(userSettings.smiliesType, userSettings.useMonkeySmilies).then(function(emotes) {
            cachedEmotes['twitchSmilies'] = emotes;
            resolve();
        });
    });
}

function getHostEmotes(host) {
    var nextPromise;

    if (HOSTS[host].requiresChannelList === true) {
        nextPromise = HOSTS[host].build(userSettings[host + 'List']);
    } else {
        nextPromise = HOSTS[host].build();
    }

    nextPromise.then(function(emotes) {
        cachedEmotes[this] = emotes;
    }.bind(host));

    return nextPromise;
}

function resetFilterRules() {
    userSettings.emoteFilterList = userSettings.emoteFilterList || [];

    applyFilterRules(true);
}

function applyFilterRules(resetRulesBoolean) {
    for (var i = 0; i < userSettings.emoteFilterList.length; ++i) {
        var rule = userSettings.emoteFilterList[i];
        var host = FILTER_TO_HOST_MAPPING[rule.set];
        var globalSet = cachedEmotes[host.global];
        var channelSet = cachedEmotes[host.channels];

        if (rule.type === 'Emote') {
            if (globalSet.hasOwnProperty(rule.value)) {
                if (resetRulesBoolean) {
                    delete globalSet[rule.value].filtered;
                } else {
                    globalSet[rule.value].filtered = true;
                }
            } else if (channelSet.hasOwnProperty(rule.value)) {
                if (resetRulesBoolean) {
                    delete channelSet[rule.value].filtered;
                } else {
                    channelSet[rule.value].filtered = true;
                }
            }
        } else if (rule.type === 'Channel') {
            for (var emoteKey in channelSet) {
                if (channelSet.hasOwnProperty(emoteKey)) {
                    var emote = channelSet[emoteKey];

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