var emoteFilter = require('./emoteFilter');


const STRING_SEPARATOR = /([\w]|[:;)(\\\/<>73#\|\]])+/g;

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
                results: searchForEmotes(message.payload.text)
            }
        });
    }
}

function searchForEmotes(text) {
    var nextWord;
    var foundEmotes = [];

    // Reset the regex
    STRING_SEPARATOR.lastIndex = 0;

    while ((nextWord = STRING_SEPARATOR.exec(text)) !== null) {
        var emote = nextWord[0];

        for (var set in emoteLibrary) {
            if (emoteLibrary.hasOwnProperty(set)) {
                var emotes = emoteLibrary[set].emotes;

                if (emotes.hasOwnProperty(emote)) {
                    var emoteData = emotes[emote];

                    if (emoteFilter.isEmoteAllowed(set, emote) === true) {
                        foundEmotes.push({
                            index: nextWord.index,
                            emote: emote,
                            url: emoteData.url,
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