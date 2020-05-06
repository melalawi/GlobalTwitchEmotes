var httpRequest = require('./httpRequest');

const CHANNEL_ID_ENDPOINT = 'https://api.twitch.tv/helix/users?login={CHANNEL_NAME}';


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

            resolve(responseJSON.data[0].id);
        }).catch(function(error) {
            console.error('Failed to retrieve "' + set + '" from ' + url + ' - ' + error);

            reject(set);
        });
    });
    
}

function getClientId() {
    return ''; // twitch api client id
}


module.exports = {
    getChannelIdFromName: getChannelIdFromName
};