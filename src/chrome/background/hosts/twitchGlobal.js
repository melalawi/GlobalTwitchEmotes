'use strict';
var httpRequest = require('../httpRequest');


var URL = 'https://twitchemotes.com/api_cache/v2/global.json';


function extractEmotesFromJSON(json) {
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

function buildEmoteList() {
    return new Promise(function(resolve, reject) {
        var getRequestPromise = httpRequest(URL);

        getRequestPromise.then(function(responseText) {
            resolve(extractEmotesFromJSON(JSON.parse(responseText)));
        }, function() {
            console.log('Could not reach twitchemotes.com');
            resolve({});
        });
    });
}

module.exports = {
    build: buildEmoteList
};