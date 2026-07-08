const CHANNEL_EMOTES_ENDPOINT = 'https://api.electrolyte.dev/twitch?channel_name={CHANNEL_NAME}';
const BASE_EMOTE_URL = 'https://static-cdn.jtvnw.net/emoticons/v1/{EMOTE_ID}/1.0';

function parseEmotes(json) {
    var channelName = json.channel_information;
    var emotes = json.data;

    var channelEmotes = {};

    for (var i = 0; i < emotes.length; ++i) {
        var name = emotes[i].name;

        channelEmotes[name] = {
            url: BASE_EMOTE_URL.replace('{EMOTE_ID}', emotes[i].id),
            channel: channelName.channel_name + " Twitch Emote"
        };
    }

    return channelEmotes;
}


module.exports = {
    parseEmotes: parseEmotes,
    getURL: function(channelName) {
        return CHANNEL_EMOTES_ENDPOINT.replace('{CHANNEL_NAME}', channelName);
    }
};