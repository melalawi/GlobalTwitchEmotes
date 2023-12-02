const URL = 'https://api.electrolyte.dev/bttv?channel_name={CHANNEL_NAME}';
const BASE_EMOTE_URL = 'https://cdn.betterttv.net/emote/{EMOTE_ID}/1x'


function parseEmotes(json) {
    var result = {};
    var emotes = json.channelEmotes.concat(json.sharedEmotes);
    var channelName = json.channel_information

    for (var i = 0; i < emotes.length; ++i) {
        var emote = emotes[i];

        result[emote.code] = {
            url: BASE_EMOTE_URL.replace('{EMOTE_ID}', emote.id),
            channel: channelName.channel_name + ' BTTV Emote'
        };
    }

    return result;
}


module.exports = {
    parseEmotes: parseEmotes,
    getURL: function(channelName) {
        return URL.replace('{CHANNEL_NAME}', channelName);
    }
};