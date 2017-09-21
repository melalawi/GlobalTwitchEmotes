var URL = 'https://twitchemotes.com/api_cache/v3/subscriber.json';
var BASE_EMOTE_URL = 'https://static-cdn.jtvnw.net/emoticons/v1/{EMOTE_ID}/1.0';
var OLD_CHANNELS = [
    '90stardust',
    'agetv1',
    'beyondthesummit',
    'canadacup',
    'delovely',
    'esg',
    'fahr3nh3it_',
    'fwiz',
    'gomexp_2014_season_two',
    'gsl',
    'ilastpack',
    'jeromewnl',
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


function parseEmotes(json) {
    var result = {};

    for (var entry in json) {
        if (json.hasOwnProperty(entry)) {
            var emoteChannel = json[entry].channel_name;
            var emotes = json[entry].emotes;
            var isOldChannel = OLD_CHANNELS.indexOf(emoteChannel.toLowerCase()) !== -1;

            for (var i = 0; i < emotes.length; ++i) {
                var code = isOldChannel ? emoteChannel + emotes[i].code : emotes[i].code;

                result[code] = {
                    url: BASE_EMOTE_URL.replace('{EMOTE_ID}', emotes[i].id),
                    channel: emoteChannel
                };
            }
        }
    }

    return result;
}


module.exports = {
    name: 'twitchChannels',
    parseEmotes: parseEmotes,
    getURL: function() {
        return URL;
    },
    requiresChannel: false
};