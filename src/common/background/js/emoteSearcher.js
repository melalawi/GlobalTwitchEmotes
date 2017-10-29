var emoteFilter = require('./emoteFilter');
var emoteManager = require('./emoteManager');


const STRING_SEPARATOR = /([\w]|[:;)(\\\/<>73#\|\]])+/g;


function initialize(settings) {
    emoteFilter.initialize(settings.emoteFilterMode, settings.emoteFilterList);
}

function searchForEmotes(text) {
    var nextWord;
    var foundEmotes = [];
    var emoteLibrary = emoteManager.getAllEmotes();

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


module.exports = {
    initialize: initialize,
    search: searchForEmotes
};