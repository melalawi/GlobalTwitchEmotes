var browser = require('browser');


const URL = browser.getURL('assets/emotes/unicodeEmojis.json');


function parseEmotes(json) {
    var result = {};

    for (var key in json) {
        if (json.hasOwnProperty(key)) {
            result[key] = {
                emoji: json[key],
                channel: ''
            }
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