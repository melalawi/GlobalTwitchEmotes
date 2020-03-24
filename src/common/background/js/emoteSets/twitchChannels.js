var httpRequest = require('../httpRequest');

const CHANNEL_ID_ENDPOINT = 'https://api.twitch.tv/kraken/users?login={CHANNEL_NAME}';
const CHANNEL_EMOTES_ENDPOINT = 'https://api.twitchemotes.com/api/v4/channels/{CHANNEL_ID}';
const BASE_EMOTE_URL = 'https://static-cdn.jtvnw.net/emoticons/v1/{EMOTE_ID}/1.0';

function getChannelIdFromName(channel_name) {
    return new Promise(function(resolve, reject) {
        var twitch_client_id = getClientId();

        console.log('Retrieving id for "' + channel_name + '" from twitch...');

        httpRequest.get(CHANNEL_ID_ENDPOINT.replace('{CHANNEL_NAME}', channel_name), {
            method: 'GET',
            headers: {
                'Accept': 'application/vnd.twitchtv.v5+json',
                'Client-Id': twitch_client_id
            }
        }).then(function(responseJSON) {
            console.log(responseJSON);

            resolve(responseJSON.users[0]._id);
        }).catch(function(error) {
            console.error('Failed to retrieve "' + set + '" from ' + url + ' - ' + error);

            reject(set);
        });
    });
    
}

function parseEmotes(json) {
    var channelName = json.channel_name;
    var emotes = json.emotes;

    var channelEmotes = {};

    for (var i = 0; i < emotes.length; ++i) {
        var code = emotes[i].code;

        channelEmotes[code] = {
            url: BASE_EMOTE_URL.replace('{EMOTE_ID}', emotes[i].id),
            channel: channelName
        };
    }

    return channelEmotes;
}

function getClientId() {
    return ''; // add twitch api client id here
}


module.exports = {
    parseEmotes: parseEmotes,
    getChannelIdFromName: getChannelIdFromName,
    getURL: function(channel_id) {
        return CHANNEL_EMOTES_ENDPOINT.replace('{CHANNEL_ID}', channel_id);
    }
};