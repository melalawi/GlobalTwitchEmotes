const URL = 'https://api.frankerfacez.com/v1/set/global';


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
                    channel: 'FrankerFaceZ Emote'
                };
            }
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