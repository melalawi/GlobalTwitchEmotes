const URL = 'https://api.twitchemotes.com/api/v4/channels/0';
const BASE_EMOTE_URL = 'https://static-cdn.jtvnw.net/emoticons/v1/{EMOTE_ID}/1.0';


function parseEmotes(json) {
    var result = {};
    var emoteList = json.emotes;

    for (var i = 0; i < emoteList.length; i++) {
        var code = emoteList[i].code;
        var id = emoteList[i].id;

        result[code] = {
            url: BASE_EMOTE_URL.replace('{EMOTE_ID}', id),
            channel: ''
        };
    }
    return result;
}


module.exports = {
    parseEmotes: parseEmotes,
    getURL: function() {
        return URL;
    }
};