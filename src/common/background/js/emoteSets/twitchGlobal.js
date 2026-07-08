const URL = 'https://api.electrolyte.dev/twitch/global';
const BASE_EMOTE_URL = 'https://static-cdn.jtvnw.net/emoticons/v1/{EMOTE_ID}/1.0';


function parseEmotes(json) {
    var result = {};
    var emoteList = json.data;

    for (var i = 0; i < emoteList.length; i++) {
        var name = emoteList[i].name;
        var id = emoteList[i].id;

        result[name] = {
            url: BASE_EMOTE_URL.replace('{EMOTE_ID}', id),
            channel: 'Global Twitch Emote'
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