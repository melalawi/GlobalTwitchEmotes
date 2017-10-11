const URL = 'https://twitchemotes.com/api_cache/v3/global.json';
const BASE_EMOTE_URL = 'https://static-cdn.jtvnw.net/emoticons/v1/{EMOTE_ID}/1.0';


function parseEmotes(json) {
    var result = {};

    for (var emoteKey in json) {
        if (json.hasOwnProperty(emoteKey)) {
            result[emoteKey] = {
                url: BASE_EMOTE_URL.replace('{EMOTE_ID}', json[emoteKey].id),
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