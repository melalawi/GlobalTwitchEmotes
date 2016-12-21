'use strict';
var BASE64_PREFIX = 'data:image/png;base64,';


function extractEmotesFromJSON(json) {
    var result = {};

    for (var i = 0; i < json.length; ++i) {
        result[json[i].key] = {
            url: BASE64_PREFIX + json[i].url,
            channel: 'Custom GTE Emote'
        };
    }

    return result;
}

function buildEmoteList(customEmotesList) {
    return new Promise(function(resolve, reject) {
        resolve(extractEmotesFromJSON(customEmotesList));
    });
}

module.exports = {
    build: buildEmoteList
};