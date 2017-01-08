var URL = 'https://api.betterttv.net/2/channels';


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


module.exports = {
    name: 'bttvChannels',
    parseEmotes: parseEmotes,
    getURL: function(channelName) {
        return URL + '/' + channelName;
    },
    requiresChannel: true
};