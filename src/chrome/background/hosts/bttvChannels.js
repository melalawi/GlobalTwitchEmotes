'use strict';
var httpRequest = require('../httpRequest');


var URL = 'https://api.betterttv.net/2/channels';


function extractEmotesFromJSON(json) {
    var emotes = json.emotes;
    var templateURL = 'https:' + json.urlTemplate;
    var result = {};

    for (var i = 0; i < emotes.length; ++i) {
        var emote = emotes[i];

        result[emote.code] = {
            url: templateURL.replace('{{id}}/{{image}}', emote.id + '/1x'),
            channel: emote.channel
        };
    }

    return result;
}

function buildEmoteList(channelList) {
    var promises = [];

    for (var i = 0; i < channelList.length; ++i) {
        var nextChannel = channelList[i];
        var nextPromise = new Promise(function(resolve, reject) {
            var getRequestPromise = httpRequest(URL + '/' + nextChannel);

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