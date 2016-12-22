'use strict';
var httpRequest = require('../httpRequest');


var URL = 'https://api.frankerfacez.com/v1/set/global';


function extractEmotesFromJSON(json) {
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

function buildEmoteList() {
    return new Promise(function(resolve, reject) {
        var getRequestPromise = httpRequest(URL);

        getRequestPromise.then(function(responseText) {
            resolve(extractEmotesFromJSON(JSON.parse(responseText)));
        }, function() {
            console.log('Could not reach frankerfacez.com');
            resolve({});
        });
    });
}

module.exports = {
    build: buildEmoteList
};