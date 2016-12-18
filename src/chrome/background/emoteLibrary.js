'use strict';
var bttvChannels = require('./hosts/bttvChannels');
var bttvGlobal = require('./hosts/bttvGlobal');
var customEmotes = require('./hosts/customEmotes');
var ffzChannels = require('./hosts/ffzChannels');
var ffzGlobal = require('./hosts/ffzGlobal');
var twitchChannels = require('./hosts/twitchChannels');
var twitchGlobal = require('./hosts/twitchGlobal');


var promises = [];
var cachedEmotes = null;
var filteredEmotes = null;
var filterMode;
var ready = false;


function buildEmoteLibrary(settings) {
    var libraryPromise;

    cachedEmotes = {};

    filteredEmotes = settings.emoteFilterList;
    filterMode = settings.emoteFilterMode;

    if (settings.twitchGlobal === true) {
        var twitchGlobalPromise = twitchGlobal.build();

        promises.push(twitchGlobalPromise);

        twitchGlobalPromise.then(function(emotes) {
            addEmotes('twitchGlobal', emotes);
        });
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

    libraryPromise = Promise.all(promises);

    libraryPromise.then(function(){
        ready = true;
    });

    return libraryPromise;
}

function addEmotes(host, emotes) {
    cachedEmotes[host] = {};

    for (var emoteKey in emotes) {
        if (emotes.hasOwnProperty(emoteKey)) {
            cachedEmotes[host][emoteKey] = createEmoteEntry(host, emoteKey, emotes[emoteKey].channel, emotes[emoteKey].url);
        }
    }
}

function createEmoteEntry(emoteHost, emoteKey, emoteChannel, emoteURL) {
    var isFiltered = false;

    for (var i = 0; i < filteredEmotes.length; ++i) {
        var nextFilteredEmote = filteredEmotes[i];

        if (nextFilteredEmote.host === emoteHost && nextFilteredEmote.channel === emoteChannel && nextFilteredEmote.key === emoteKey) {
            isFiltered = true;
            break;
        }
    }

    return {
        channel: emoteChannel,
        url: emoteURL,
        allowed: (filterMode === 'Whitelist') === isFiltered
    };
}

function getEmotes() {
    if (!ready) {
        throw 'Attempt to retrieve emotes before caching';
    }

    return cachedEmotes;
}

module.exports = {
    build: buildEmoteLibrary,
    getEmotes: getEmotes
};