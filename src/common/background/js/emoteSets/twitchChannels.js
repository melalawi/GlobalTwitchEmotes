
const CHANNEL_EMOTES_ENDPOINT = 'https://api.twitchemotes.com/api/v4/channels/{CHANNEL_ID}';
const BASE_EMOTE_URL = 'https://static-cdn.jtvnw.net/emoticons/v1/{EMOTE_ID}/1.0';


function parseEmotes(json) {
    var channelName = json.channel_name;
    var emotes = json.emotes;

    var channelEmotes = {};

    for (var i = 0; i < emotes.length; ++i) {
        var code = emotes[i].code;

        channelEmotes[code] = {
            url: BASE_EMOTE_URL.replace('{EMOTE_ID}', emotes[i].id),
            channel: channelName
        };
    }

    return channelEmotes;
}


module.exports = {
    parseEmotes: parseEmotes,
    getURL: function(channelId) {
        return CHANNEL_EMOTES_ENDPOINT.replace('{CHANNEL_ID}', channelId);
    }
};