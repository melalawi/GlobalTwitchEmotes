'use strict';
var httpRequest = require('../httpRequest');


var URL = 'https://api.frankerfacez.com/v1/';


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
                    channel: json.room.display_name
                };
            }
        }
    }

    return result;
}

function buildEmoteList(channelList) {
    var promises = [];

    for (var i = 0; i < channelList.length; ++i) {
        var nextChannel = channelList[i];
        var nextPromise = new Promise(function(resolve, reject) {
            var getRequestPromise = httpRequest(URL + 'room/' + nextChannel.toLowerCase());

            getRequestPromise.then(function(responseText) {
                resolve(extractEmotesFromJSON(JSON.parse(responseText)));
            }, reject);
        });

        promises.push(nextPromise);
    }

    return Promise.all(promises);
}

module.exports = {
    build: buildEmoteList
};