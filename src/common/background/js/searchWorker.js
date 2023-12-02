var emoteFilter = require('./emoteFilter');


const STRING_SEPARATOR = /([\w]|[:;)(\\\/<>73#\|\]])+/g;
const TWITCH_TV_MATCHING_REGEX = /\btwitch\.tv/i;

var emoteLibrary = {};


onmessage = function(event) {
    handleMessage(event.data);
};

function handleMessage(message) {
    if (message.header === 'settings') {
        emoteFilter.initialize(message.payload.emoteFilterMode, message.payload.emoteFilterList);
    } else if (message.header === 'emotes') {
        emoteLibrary = message.payload;
    } else if (message.header === 'search') {
        postMessage({
            header: 'searchResults',
            payload: {
                searchID: message.payload.searchID,
                results: searchForEmotes(message.payload.text, TWITCH_TV_MATCHING_REGEX.test(message.payload.hostname) === false)
            }
        });
    }
}

function searchForEmotes(text, allowSubscriberEmotes) {
    var nextWord;
    var foundEmotes = [];

    // Reset the regex
    STRING_SEPARATOR.lastIndex = 0;

    while ((nextWord = STRING_SEPARATOR.exec(text)) !== null) {
        var emote = nextWord[0];

        for (var set in emoteLibrary) {
            if (emoteLibrary.hasOwnProperty(set)) {
                // Do not render subscriber emoticons on Twitch.tv
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