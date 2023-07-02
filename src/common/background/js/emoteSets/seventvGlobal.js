const GLOBAL_EMOTES_ENDPOINT = 'https://emotes.adamcy.pl/v1/global/emotes/7tv';

function parseEmotes(json, set) {
    var result = {};
    for (var i = 0; i < json.length; ++i) {
        result[json[i].code] = {
            url: json[i].urls[0].url,
            channel: '7TV Global Emote'
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