var URL = 'https://twitchemotes.com/api_cache/v2/global.json';


function parseEmotes(json) {
    var emotes = json.emotes;
    var templateURL = json.template.small;
    var result = {};

    for (var emoteKey in emotes) {
        if (emotes.hasOwnProperty(emoteKey)) {
            result[emoteKey] = {
                url: templateURL.replace('{image_id}', emotes[emoteKey].image_id),
                channel: ''
            };
        }
    }

    return result;
}


module.exports = {
    name: 'twitchGlobal',
    parseEmotes: parseEmotes,
    getURL: function() {
        return URL;
    },
    requiresChannel: false
};