'use strict';
var httpRequest = require('../httpRequest');


var URL = 'https://twitchemotes.com/api_cache/v2/subscriber.json';
var OLD_CHANNELS = [
    '90stardust',
    'agetv1',
    'beyondthesummit',
    'canadacup',
    'delovely',
    'esg',
    'fahr3nh3it_ftw',
    'fwiz',
    'gomexp_2014_season_two',
    'gsl',
    'ilastpack',
    'jewelxo',
    'lcs_pros_in_koreansoloq',
    'nadeshot',
    'ncespa',
    'qfmarine',
    'shawk',
    'smitegame',
    'srkevo1',
    'starladder1',
    'thepremierleague',
    'werster',
    'worldclasslol',
    'wr3tched_'
];


function extractEmotesFromJSON(json) {
    var channels = json.channels;
    var templateURL = json.template.small;
    var result = {};

    for (var emoteChannel in channels) {
        if (channels.hasOwnProperty(emoteChannel)) {
            var emotes = channels[emoteChannel].emotes;
            var isOldChannel = OLD_CHANNELS.indexOf(emoteChannel.toLowerCase()) !== -1;

            for (var i = 0; i < emotes.length; ++i) {
                var emoteKey = isOldChannel ? emoteChannel + emotes[i].code : emotes[i].code;

                result[emoteKey] = {
                    url: templateURL.replace('{image_id}', emotes[i].image_id),
                    channel: emoteChannel
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
            console.log('Could not reach twitchemotes.com');
            resolve({});
        });
    });
}

module.exports = {
    build: buildEmoteList,
    requiresChannelList: false
};