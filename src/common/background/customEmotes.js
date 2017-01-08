function extractEmotesFromJSON(json) {
    var result = {};

    for (var i = 0; i < json.length; ++i) {
        result[json[i].key] = {
            url: json[i].url,
            channel: 'Custom GTE Emote'
        };
    }

    return result;
}

function buildEmoteList(customEmotesList) {
    return new Promise(function(resolve) {
        try {
            resolve(extractEmotesFromJSON(customEmotesList));
        } catch (e) {
            resolve({});
        }
    });
}

module.exports = {
    build: buildEmoteList
};