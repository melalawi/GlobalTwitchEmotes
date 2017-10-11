var browser = require('browser');


const URL = browser.getURL('assets/emotes/twitchSmilies.json');


function parseEmotes(emotesJSON, emoteSetName, overrideWithMonkeys) {
    var result = {};

    for (var emoteKey in emotesJSON[emoteSetName]) {
        if (emotesJSON[emoteSetName].hasOwnProperty(emoteKey)) {
            var emoteURL;

            if (overrideWithMonkeys === true && emotesJSON['Monkey'].hasOwnProperty(emoteKey)) {
                emoteURL = emotesJSON['Monkey'][emoteKey];
            } else {
                emoteURL = emotesJSON[emoteSetName][emoteKey];
            }

            result[emoteKey] = {
                url: emoteURL,
                channel: ''
            };
        }
    }

    return result;
}

module.exports = {
    parseEmotes: parseEmotes,
    getURL: function() {
        return URL;
    }
};