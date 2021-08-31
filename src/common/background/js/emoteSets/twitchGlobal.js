const URL = 'https://api.twitch.tv/helix/chat/emotes/global/';
const BASE_EMOTE_URL = 'https://static-cdn.jtvnw.net/emoticons/v2/{EMOTE_ID}/default/light/1.0';


function parseEmotes(json) {
    var result = {};
    var emoteList = json.data;

    for (var i = 0; i < emoteList.length; i++) {
        var name = emoteList[i].name;
        var id = emoteList[i].id;

        result[name] = {
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