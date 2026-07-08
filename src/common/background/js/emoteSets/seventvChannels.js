const URL = 'https://api.electrolyte.dev/seventv?channel_name={CHANNEL_NAME}';
const BASE_EMOTE_URL = 'https://cdn.7tv.app/emote/{EMOTE_ID}/1x.webp'


function parseEmotes(json) {
    var channelName = json.channel_information;
    var emotes = json.data;

    var channelEmotes = {};

    for (var i = 0; i < emotes.length; ++i) {
        var name = emotes[i].name;
        var zeroWidthFlag = emotes[i].flags;

        if(zeroWidthFlag === 1) {
            channelEmotes[name] = {
                url: BASE_EMOTE_URL.replace('{EMOTE_ID}', emotes[i].id),
                channel: channelName.channel_name + ' 7TV Emote',
                zerowidth: true
            };
        } else {
            channelEmotes[name] = {
                url: BASE_EMOTE_URL.replace('{EMOTE_ID}', emotes[i].id),
                channel: channelName.channel_name + ' 7TV Emote'
            };
        }
    }

    return channelEmotes;
}

module.exports = {
    parseEmotes: parseEmotes,
    getURL: function (channelName) {
        return URL.replace("{CHANNEL_NAME}", channelName);
    }
};