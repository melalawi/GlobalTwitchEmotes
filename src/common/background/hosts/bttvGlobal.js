'use strict';
var URL = 'https://api.betterttv.net/2/emotes';


function parseEmotes(json) {
    var emotes = json.emotes;
    var templateURL = 'https:' + json.urlTemplate;
    var result = {};

    for (var i = 0; i < emotes.length; ++i) {
        var emote = emotes[i];

        result[emote.code] = {
            url: templateURL.replace('{{id}}/{{image}}', emote.id + '/1x'),
            channel: 'BetterTTV Emote'
        };
    }

    return result;
}


module.exports = {
    name: 'bttvGlobal',
    parseEmotes: parseEmotes,
    getURL: function() {
        return URL;
    },
    requiresChannel: false
};