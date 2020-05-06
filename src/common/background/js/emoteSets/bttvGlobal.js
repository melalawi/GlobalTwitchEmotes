const GLOBAL_EMOTES_ENDPOINT = 'https://api.betterttv.net/3/cached/emotes/global';
const BASE_EMOTE_URL = 'https://cdn.betterttv.net/emote/{EMOTE_ID}/1x'


function parseEmotes(json) {
    var result = {};

    for (var i = 0; i < json.length; ++i) {
        var emote = json[i];

        result[emote.code] = {
            url: BASE_EMOTE_URL.replace('{EMOTE_ID}', emote.id),
            channel: 'BetterTTV Emote'
        };
    }

    return result;
}

module.exports = {
    parseEmotes: parseEmotes,
    getURL: function() {
        return GLOBAL_EMOTES_ENDPOINT;
    }
};