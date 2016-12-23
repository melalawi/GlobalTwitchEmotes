'use strict';
var extend = require('extend');
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

function retrieveAllChannelsEmotes(channelList) {
    var promises = [];

    for (var i = 0; i < channelList.length; ++i) {
        var nextChannel = channelList[i];
        var nextPromise = new Promise(function(resolve, reject) {
            var getRequestPromise = httpRequest(URL + 'room/' + this);

            getRequestPromise.then(function(responseText) {
                resolve(extractEmotesFromJSON(JSON.parse(responseText)));
            }, function() {
                console.log('Could not load FFZ emotes for channel "' + this + '"');
                resolve({});
            }.bind(this));
        }.bind(nextChannel.toLowerCase()));

        promises.push(nextPromise);
    }

    return Promise.all(promises);
}

function buildEmoteList(channelList) {
    return new Promise(function(resolve, reject) {
        retrieveAllChannelsEmotes(channelList).then(function(channelsEmotes) {
            var result = {};

            for (var i = 0; i < channelsEmotes.length; ++i) {
                extend(true, result, channelsEmotes[i]);
            }

            resolve(result);
        });
    });
}

module.exports = {
    build: buildEmoteList,
    requiresChannelList: true
};