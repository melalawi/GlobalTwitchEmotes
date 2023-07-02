const URL = 'https://emotes.adamcy.pl/v1/channel/{CHANNEL_NAME}/emotes/ffz';


function parseEmotes(json, set) {
    var result = {};

    for (var i = 0; i < json.length; i++) {
        result[json[i].code] = {
            url: json[i].urls[0].url.substring(6),
            channel: set.substring(12) + " FFZ Channel Emote"
        };
    }
    return result;
}


module.exports = {
    parseEmotes: parseEmotes,
    getURL: function(channel_name) {
        return URL.replace('{CHANNEL_NAME}', channel_name);
    }
};