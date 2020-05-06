const URL = 'https://api.betterttv.net/3/cached/users/twitch';


function parseEmotes(json) {
    var emotes = json.emotes;
    var templateURL = 'https:' + json.urlTemplate;
    var result = {};

    for (var i = 0; i < emotes.length; ++i) {
        var emote = emotes[i];

        result[emote.code] = {
            url: templateURL.replace('{{id}}/{{image}}', emote.id + '/1x'),
            channel: emote.channel
        };
    }

    return result;
}

const BASE_EMOTE_URL = 'https://cdn.betterttv.net/emote/{EMOTE_ID}/1x'


function parseEmotes(json) {
    var result = {};

    for (var i = 0; i < json.channelEmotes.length; ++i) {
        var emote = json.channelEmotes[i];

        result[emote.code] = {
            url: BASE_EMOTE_URL.replace('{EMOTE_ID}', emote.id),
            channel: 'BetterTTV Emote'
        };
    }

    return result;
}


module.exports = {
    parseEmotes: parseEmotes,
    getURL: function(channelId) {
        return URL + '/' + channelId;
    }
};