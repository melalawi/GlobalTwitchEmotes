const URL = 'https://twitchemotes.com/api_cache/v3/subscriber.json';
const BASE_EMOTE_URL = 'https://static-cdn.jtvnw.net/emoticons/v1/{EMOTE_ID}/1.0';


function parseEmotes(json) {
    var result = {};

    for (var entry in json) {
        if (json.hasOwnProperty(entry)) {
            var channelName = json[entry].channel_name;
            var emotes = json[entry].emotes;

            var channelEmotes = {};

            for (var i = 0; i < emotes.length; ++i) {
                var code = emotes[i].code;

                channelEmotes[code] = {
                    url: BASE_EMOTE_URL.replace('{EMOTE_ID}', emotes[i].id),
                    channel: channelName
                };
            }

            result[channelName.toLowerCase()] = channelEmotes;
        }
    }

    return result;
}


module.exports = {
    parseEmotes: parseEmotes,
    getURL: function() {
        return URL;
    }
};