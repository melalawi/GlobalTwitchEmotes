/*
var httpRequest = require('./httpRequest');

const CHANNEL_ID_ENDPOINT = 'https://api.twitch.tv/helix/users?login={CHANNEL_NAME}';
const CLIENT_ID = '';
const BEARER_TOKEN_ENDPOINT = 'https://id.twitch.tv/oauth2/token?client_id={CLIENT_ID}&grant_type=client_credentials&client_secret={CLIENT_SECRET}'

function getBearerToken() {
    return new Promise(function(resolve, reject) {
        httpRequest.get(BEARER_TOKEN_ENDPOINT.replace('{CLIENT_SECRET}', getClientSecret()).replace('{CLIENT_ID}', CLIENT_ID), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        }).then(function(responseJSON) {
            console.log(responseJSON);

            resolve(responseJSON.access_token);
        }).catch(function(error) {
            console.error('Failed to retrieve access token - ' + error);

            reject(error);
        });
    });
}

function getChannelIdFromName(channel_name) {
    return new Promise(function(resolve, reject) {
        console.log('Retrieving id for "' + channel_name + '" from twitch...');

        getBearerToken().then(function(access_token) {
            httpRequest.get(CHANNEL_ID_ENDPOINT.replace('{CHANNEL_NAME}', channel_name), {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': 'Bearer ' + access_token,
                    'Client-Id': CLIENT_ID
                }
            }).then(function(responseJSON) {
                console.log(responseJSON);
    
                resolve(responseJSON.data[0].id);
            }).catch(function(error) {
                console.error(error);
    
                reject(channel_name);
            });
        }).catch(reject);
        
    });
}

function getClientSecret() {
    return ''; // twitch client secret
}

function getClientID() {
    return CLIENT_ID;
}

module.exports = {
    getClientID: getClientID,
    getBearerToken: getBearerToken,
    getChannelIdFromName: getChannelIdFromName
};*/

