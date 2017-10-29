function parseEmotes(json) {
    var result = {};

    for (var i = 0; i < json.length; ++i) {
        result[json[i].key] = {
            url: json[i].url,
            channel: 'Custom GTE Emote'
        };
    }

    return result;
}


module.exports = {
    parseEmotes: parseEmotes
};