'use strict';
var httpRequest = require('../httpRequest');


var URL = 'https://api.betterttv.net/2/emotes';


function extractEmotesFromJSON(json) {
    var emotes = json.emotes;
    var templateURL = 'https:' + json.urlTemplate;
    var result = {};

    for (var i = 0; i < emotes.length; ++i) {
        var emote = emotes[i];

        result[emote.code] = {
            url: templateURL.replace('{{id}}/{{image}}', emote.id + '/1x'),
            channel: 'BetterTTV Emotes'
        };
    }

    return result;
}

function buildEmoteList() {
    return new Promise(function(resolve, reject) {
        var getRequestPromise = httpRequest(URL);

        getRequestPromise.then(function(responseText) {
            resolve(extractEmotesFromJSON(JSON.parse(responseText)));
        }, reject);
    });
}

module.exports = {
    build: buildEmoteList
};