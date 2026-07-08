var emoteFilter = require('./emoteFilter');

const STRING_SEPARATOR = /([\w]|[:;)(\\\/<>73#\|\]])+/g;
const TWITCH_TV_MATCHING_REGEX = /\btwitch\.tv/i;

var emoteLibrary = {};

function initialize() {
    // no worker pool anymore — nothing to set up
}

function setEmotes(emotes) {
    emoteLibrary = emotes;
}

function setSettings(settings) {
    emoteFilter.initialize(settings.emoteFilterMode, settings.emoteFilterList);
}

function search(requestID, hostname, text, callback) {
    var results = searchForEmotes(text, TWITCH_TV_MATCHING_REGEX.test(hostname) === false);

    if (results.length > 0) {
        callback({
            header: 'emoteSearchResults',
            payload: {
                id: requestID,
                foundEmotes: results
            }
        });
    }
}

function searchForEmotes(text, allowSubscriberEmotes) {
    var nextWord;
    var foundEmotes = [];

    STRING_SEPARATOR.lastIndex = 0;

    while ((nextWord = STRING_SEPARATOR.exec(text)) !== null) {
        var emote = nextWord[0];

        for (var set in emoteLibrary) {
            if (emoteLibrary.hasOwnProperty(set)) {
                if (set.indexOf('twitchChannels') !== -1 && allowSubscriberEmotes === false) {
                    continue;
                }

                var emotes = emoteLibrary[set].emotes;

                if (emotes.hasOwnProperty(emote)) {
                    var emoteData = emotes[emote];

                    if (emoteFilter.isEmoteAllowed(set, emote) === true) {
                        foundEmotes.push({
                            index: nextWord.index,
                            emote: emote,
                            url: emoteData.url,
                            zerowidth: emoteData.zerowidth,
                            emoji: emoteData.emoji,
                            channel: emoteData.channel
                        });

                        break;
                    }
                }
            }
        }
    }

    return foundEmotes;
}

module.exports = {
    initialize: initialize,
    setEmotes: setEmotes,
    setSettings: setSettings,
    search: search
};
