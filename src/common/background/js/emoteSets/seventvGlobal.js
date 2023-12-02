const GLOBAL_EMOTES_ENDPOINT = 'https://api.electrolyte.dev/seventv/global';
const BASE_EMOTE_URL = 'https://cdn.7tv.app/emote/{EMOTE_ID}/1x.webp'


function parseEmotes(json) {
    var result = {};
    var emoteList = json.emotes;

    for (var i = 0; i < emoteList.length; ++i) {
        var name = emoteList[i].name;
        var id = emoteList[i].id;
        var zerowidthFlag = emoteList[i].flags;

        if(zerowidthFlag === 1) {
            result[name] = {
                url: BASE_EMOTE_URL.replace('{EMOTE_ID}', id),
                channel: 'Global 7TV Emote',
                zerowidth: true
            };
        } else {
            result[name] = {
                url: BASE_EMOTE_URL.replace('{EMOTE_ID}', id),
                channel: 'Global 7TV Emote'
            };
        }
    }

    return result;
}

module.exports = {
    parseEmotes: parseEmotes,
    getURL: function() {
        return GLOBAL_EMOTES_ENDPOINT;
    }
};