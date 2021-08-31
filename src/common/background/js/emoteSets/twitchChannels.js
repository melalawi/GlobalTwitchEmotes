const CHANNEL_EMOTES_ENDPOINT = 'https://api.twitch.tv/helix/chat/emotes?broadcaster_id=';
const BASE_EMOTE_URL = 'https://static-cdn.jtvnw.net/emoticons/v2/{EMOTE_ID}/default/light/1.0';


function parseEmotes(json) {
    var channelName = json.channel_name;
    var emotes = json.data;

    var channelEmotes = {};

    for (var i = 0; i < emotes.length; ++i) {
        var name = emotes[i].name;

        channelEmotes[name] = {
            url: BASE_EMOTE_URL.replace('{EMOTE_ID}', emotes[i].id),
            channel: channelName
        };
    }

    return channelEmotes;
}


module.exports = {
    parseEmotes: parseEmotes,
    getURL: function() {
        return CHANNEL_EMOTES_ENDPOINT;
    }
};