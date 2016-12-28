'use strict';
var URL = 'https://api.frankerfacez.com/v1/';


function parseEmotes(json) {
    var sets = json.sets;
    var result = {};

    for (var emoteSet in sets) {
        if (sets.hasOwnProperty(emoteSet)) {
            var emotes = sets[emoteSet].emoticons;

            for (var i = 0; i < emotes.length; ++i) {
                var emote = emotes[i];

                result[emote.name] = {
                    url: 'https:' + emote.urls['1'],
                    channel: json.room.display_name
                };
            }
        }
    }

    return result;
}


module.exports = {
    name: 'ffzChannels',
    parseEmotes: parseEmotes,
    getURL: function(channelName) {
        return URL + 'room/' + channelName.toLowerCase();
    },
    requiresChannel: true
};