'use strict';
var extend = require('extend');
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

function retrieveAllChannelsEmotes(channelList) {
    var promises = [];

    for (var i = 0; i < channelList.length; ++i) {
        var nextChannel = channelList[i];

        var nextPromise = new Promise(function(resolve, reject) {
            var getRequestPromise = httpRequest(URL + '/' + this);

            getRequestPromise.then(function(responseText) {
                resolve(extractEmotesFromJSON(JSON.parse(responseText)));
            }, function() {
                console.log('Could not load BTTV emotes for channel "' + this + '"');
                resolve({});
            }.bind(this));
        }.bind(nextChannel));

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