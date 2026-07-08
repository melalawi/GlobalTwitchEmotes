const GLOBAL_EMOTES_ENDPOINT = 'https://api.electrolyte.dev/bttv/global';
const BASE_EMOTE_URL = 'https://cdn.betterttv.net/emote/{EMOTE_ID}/1x'


function parseEmotes(json) {
    var result = {};
    var emoteList = json.data;

    for (var i = 0; i < emoteList.length; ++i) {
        var name = emoteList[i].code;
        var id = emoteList[i].id;

        if (name === 'CandyCane' || name === 'cvHazmat' ||
            name === 'cvMask' || name === 'IceCold' ||
            name === 'ReinDeer' || name === 'SantaHat' ||
            name === 'SoSnowy' || name === 'TopHat') {
            result[name] = {
                url: BASE_EMOTE_URL.replace('{EMOTE_ID}', id),
                channel: 'Global BTTV Emote',
                zerowidth: true
            };
        }
        else {
            result[name] = {
                url: BASE_EMOTE_URL.replace('{EMOTE_ID}', id),
                channel: 'Global BTTV Emote'
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