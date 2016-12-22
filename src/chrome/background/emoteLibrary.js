'use strict';
var bttvChannels = require('./hosts/bttvChannels');
var bttvGlobal = require('./hosts/bttvGlobal');
var customEmotes = require('./hosts/customEmotes');
var ffzChannels = require('./hosts/ffzChannels');
var ffzGlobal = require('./hosts/ffzGlobal');
var twitchChannels = require('./hosts/twitchChannels');
var twitchGlobal = require('./hosts/twitchGlobal');


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
var promises = [];
var cachedEmotes = null;
var filteredEmotes = [];
var filterMode;
var ready = false;


function updateEmoteLibrary(settings) {
    var libraryPromise;

    cachedEmotes = cachedEmotes || {};

    resetFilterRules();

    filteredEmotes = settings.emoteFilterList;
    filterMode = settings.emoteFilterMode;

    if (cachedEmotes.twitchGlobal != null) {
        if (settings.twitchGlobal === false) {
            delete cachedEmotes['twitchGlobal'];
        }
    } else {
        if (settings.twitchGlobal === true) {
            var twitchGlobalPromise = twitchGlobal.build();

            promises.push(twitchGlobalPromise);

            twitchGlobalPromise.then(function(emotes) {
                cachedEmotes['twitchGlobal'] = emotes;
            });
        }
    }

    if (cachedEmotes.twitchChannels != null) {
        if (settings.twitchChannels === false) {
            delete cachedEmotes['twitchChannels'];
        }
    } else {
        if (settings.twitchChannels === true) {
            var twitchChannelsPromise = twitchChannels.build();

            promises.push(twitchChannelsPromise);

            twitchChannelsPromise.then(function(emotes) {
                cachedEmotes['twitchChannels'] = emotes;
            });
        }
    }
    /*
    if (settings.twitchGlobal === true) {
        var twitchGlobalPromise = twitchGlobal.build();

        promises.push(twitchGlobalPromise);

        twitchGlobalPromise.then(function(emotes) {
            addEmotes('twitchGlobal', emotes);
        });
    } else {
        delete cachedEmotes.twitchGlobal;
    }

    if (settings.twitchChannels === true) {
        var twitchChannelsPromise = twitchChannels.build();

        promises.push(twitchChannelsPromise);

        twitchChannelsPromise.then(function(emotes) {
            addEmotes('twitchChannels', emotes);
        });
    }

    if (settings.bttvGlobal === true) {
        var bttvGlobalPromise = bttvGlobal.build();

        promises.push(bttvGlobalPromise);

        bttvGlobalPromise.then(function(emotes) {
            addEmotes('bttvGlobal', emotes);
        });
    }

    if (settings.bttvChannels === true) {
        var bttvChannelsPromise = bttvChannels.build(settings.bttvChannelList);

        promises.push(bttvChannelsPromise);

        bttvChannelsPromise.then(function(channelEmotesList) {
            for (var i = 0; i < channelEmotesList.length; ++i) {
                addEmotes('bttvChannels', channelEmotesList[i]);
            }
        });
    }

    if (settings.ffzGlobal === true) {
        var ffzGlobalPromise = ffzGlobal.build();

        promises.push(ffzGlobalPromise);

        ffzGlobalPromise.then(function(emotes) {
            addEmotes('ffzGlobal', emotes);
        });
    }

    if (settings.ffzChannels === true) {
        var ffzChannelsPromise = ffzChannels.build(settings.ffzChannelList);

        promises.push(ffzChannelsPromise);

        ffzChannelsPromise.then(function(channelEmotesList) {
            for (var i = 0; i < channelEmotesList.length; ++i) {
                addEmotes('ffzChannels', channelEmotesList[i]);
            }
        });
    }

    if (settings.customEmotes === true) {
        var customEmotesPromise = customEmotes.build(settings.customEmotesList);

        promises.push(customEmotesPromise);

        customEmotesPromise.then(function(emotes) {
            addEmotes('customEmotes', emotes);
        });
    }
*/
    libraryPromise = Promise.all(promises);

    libraryPromise.then(function() {
        applyFilterRules();

        ready = true;
    });

    return libraryPromise;
}

function resetFilterRules() {
    applyFilterRules(true);
}

function applyFilterRules(resetRulesBoolean) {
    for (var i = 0; i < filteredEmotes.length; ++i) {
        var rule = filteredEmotes[i];
        var host = FILTER_TO_HOST_MAPPING[rule.set];
        var globalSet = cachedEmotes[host.global];
        var channelSet = cachedEmotes[host.channels];

        if (rule.type === 'Emote') {
            if (globalSet.hasOwnProperty(rule.emote)) {
                if (resetRulesBoolean) {
                    delete globalSet[rule.emote].filtered;
                } else {
                    globalSet[rule.emote].filtered = true;
                }
            } else if (channelSet.hasOwnProperty(rule.emote)) {
                if (resetRulesBoolean) {
                    delete channelSet[rule.emote].filtered;
                } else {
                    channelSet[rule.emote].filtered = true;
                }
            }
        } else if (rule.type === 'Channel') {
            for (var emoteKey in channelSet) {
                if (channelSet.hasOwnProperty(emoteKey)) {
                    var emote = channelSet[emoteKey];

                    if (emote.channel === rule.channel) {
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