const URL = 'https://emotes.adamcy.pl/v1/channel/{CHANNEL_NAME}/emotes/twitch';

function parseEmotes(json, set) {
    var channelEmotes = {};

    for (var i = 0; i < json.length; i++) {
        channelEmotes[json[i].code] = {
            url: json[i].urls[0].url,
            channel: set.substring(15) + " Twitch Channel Emote"
        };
    }

    return channelEmotes;
}


module.exports = {
    parseEmotes: parseEmotes,
    getURL: function(channel_name) {
        return URL.replace('{CHANNEL_NAME}', channel_name);
    }
};