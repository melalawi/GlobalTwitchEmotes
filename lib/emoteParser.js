var GTE_PARSER = (function () {

"use strict";

const OLD_CHANNELS = [
    '90stardust',
    'agetv1',
    'beyondthesummit',
    'canadacup',
    'delovely',
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

const EMOTE_MAIN_HOSTS = {
    TEGlobals: {
        name: 'TE',
        baseURL: 'https://twitchemotes.com/api_cache/v2/global.json',

        getBaseURL: function() { return this.baseURL; },

        parse: function (parsedJSON, listCallback) {
            var emotes = parsedJSON.emotes,
                templateURL = parsedJSON.template.small,
                parsedCollection = {
                    host: this.name,
                    channel: undefined,
                    emotes: []
                };

            for (var key in emotes) {
                if (emotes.hasOwnProperty(key)) {
                    var emoteURL = templateURL.replace('{image_id}', emotes[key].image_id);

                    parsedCollection.emotes.push({emoteName: key, emoteData: generateEmote(key, emoteURL, '')});
                }
            }

            listCallback(parsedCollection);
        }
    },

    TEChannels: {
        name: 'TE',
        baseURL: 'https://twitchemotes.com/api_cache/v2/subscriber.json',

        getBaseURL: function() { return this.baseURL; },

        parse: function (parsedJSON, listCallback) {
            var channels = parsedJSON.channels,
                templateURL = parsedJSON.template.small;

            for (var key in channels) {
                if (channels.hasOwnProperty(key)) {
                    var currentChannel = channels[key].id,
                        emotes = channels[key].emotes,
                        problemEmote = OLD_CHANNELS.indexOf(currentChannel.toLowerCase()) !== -1,
                        parsedCollection = {
                            host: this.name,
                            channel: currentChannel,
                            emotes: []
                        };

                    for (var emoteKey in emotes) {
                        if (emotes.hasOwnProperty(emoteKey)) {
                            var emoteName = emotes[emoteKey].code,
                                emoteURL = templateURL.replace('{image_id}', emotes[emoteKey].image_id);

                            if (problemEmote) {
                                emoteName = currentChannel + emoteName;
                            }

                            parsedCollection.emotes.push({emoteName: emoteName, emoteData: generateEmote(emoteName, emoteURL, currentChannel)});
                        }
                    }

                    listCallback(parsedCollection);
                }
            }
        }
    },

    TSMonkeys: {
        name: 'TE',
        baseURL: 'LOCAL_URL/emotes/monkeySmilies.JSON',

        getBaseURL: function() {
            return this.baseURL;
        },

        parse: function (parsedJSON, listCallback) {
            var emotes = parsedJSON,
                parsedCollection = {
                    host: this.name,
                    channel: undefined,
                    emotes: []
                };

            for (var key in emotes) {
                if (emotes.hasOwnProperty(key)) {
                    var emoteURL = emotes[key];

                    parsedCollection.emotes.push({emoteName: key, emoteData: generateEmote(key, emoteURL, '')});
                }
            }

            listCallback(parsedCollection);
        }
    },

    BTTVGlobals: {
        name: 'BTTV',
        baseURL: 'https://api.betterttv.net/2/emotes/',

        getBaseURL: function() { return this.baseURL; },

        parse: function (parsedJSON, listCallback) {
            var templateURL = 'http:' + parsedJSON.urlTemplate,
                emotes = parsedJSON.emotes,
                parsedCollection = {
                    host: this.name,
                    channel: undefined,
                    emotes: []
                };

            for (var key in emotes) {
                if (emotes.hasOwnProperty(key)) {
                    var emoteURL = templateURL.replace('{{id}}/{{image}}', emotes[key].id + '/1x');

                    parsedCollection.emotes.push({emoteName: emotes[key].code, emoteData: generateEmote(emotes[key].code, emoteURL, 'bttv')});
                }
            }

            listCallback(parsedCollection);
        }
    },

    //ffz is very volatile atm
    FFZGlobals: {
        name: 'FFZ',
        baseURL: 'https://api.frankerfacez.com/v1/set/global',

        getBaseURL: function() { return this.baseURL; },

        parse: function (parsedJSON, listCallback) {
            var sets = parsedJSON.sets,
                parsedCollection = {
                    host: this.name,
                    channel: undefined,
                    emotes: []
                };

            for (var key in sets) {
                if (sets.hasOwnProperty(key)) {
                    var emoticons = sets[key].emoticons;

                    for (var emoteKey in emoticons) {
                        if (emoticons.hasOwnProperty(emoteKey)) {
                            var emote = emoticons[emoteKey];

                            if (emote) {
                                parsedCollection.emotes.push({emoteName: emote.name, emoteData: generateEmote(emote.name, 'http:' + emote.urls['1'], 'FFZ')});
                            }
                        }
                    }
                }
            }

            listCallback(parsedCollection);
        }
    }
};

const EMOTE_CHANNEL_HOSTS = {
    BTTVChannels: {
        name: 'BTTV',
        baseURL: 'https://api.betterttv.net/2/channels/',

        getBaseURL: function(channelName) {
            return this.baseURL + channelName.toLowerCase();
        },

        parse: function (parsedJSON, listCallback, channelName) {
            var templateURL = 'http:' + parsedJSON.urlTemplate,
                emotes = parsedJSON.emotes,
                parsedCollection = {
                    host: this.name,
                    channel: channelName,
                    emotes: []
                };

            for (var key in emotes) {
                if (emotes.hasOwnProperty(key)) {
                    var emoteURL = templateURL.replace('{{id}}/{{image}}', emotes[key].id + '/1x');

                    parsedCollection.emotes.push({emoteName: emotes[key].code, emoteData: generateEmote(emotes[key].code, emoteURL, channelName)});
                }
            }

            listCallback(parsedCollection);
        }
    },

    TSChannels: {
        name: 'TE',
        baseURL: 'LOCAL_URL/emotes/TYPESmilies.JSON',

        getBaseURL: function(channelName) {
            return this.baseURL.replace('TYPE', channelName.toLowerCase());
        },

        parse: function (parsedJSON, listCallback) {
            var emotes = parsedJSON,
                parsedCollection = {
                    host: this.name,
                    channel: undefined,
                    emotes: []
                };

            for (var key in emotes) {
                if (emotes.hasOwnProperty(key)) {
                    var emoteURL = emotes[key];

                    parsedCollection.emotes.push({emoteName: key, emoteData: generateEmote(key, emoteURL, '')});
                }
            }

            listCallback(parsedCollection);
        }
    },

    //ffz is very volatile atm
    FFZChannels: {
        name: 'FFZ',
        baseURL: 'https://api.frankerfacez.com/v1/',

        getBaseURL: function(channelName) {
            return this.baseURL + 'room/' + channelName.toLowerCase();//appending slash breaks ffz... for some reason
        },

        parse: function (parsedJSON, listCallback) {
            var channelName = parsedJSON.room.display_name,
                sets = parsedJSON.sets,
                parsedCollection = {
                    host: this.name,
                    channel: channelName,
                    emotes: []
                };

            for (var key in sets) {
                if (sets.hasOwnProperty(key)) {
                    var emoticons = sets[key].emoticons;

                    for (var emoteKey in emoticons) {
                        if (emoticons.hasOwnProperty(emoteKey)) {
                            var emote = emoticons[emoteKey];

                            if (emote) {
                                parsedCollection.emotes.push({emoteName: emote.name, emoteData: generateEmote(emote.name, 'http:' + emote.urls['1'], channelName)});
                            }
                        }
                    }

                }
            }

            listCallback(parsedCollection);
        }
    }
};

const EMOTE_HOSTS = {
    TEGlobals: EMOTE_MAIN_HOSTS.TEGlobals,
    TEChannels: EMOTE_MAIN_HOSTS.TEChannels,

    TSChannels: EMOTE_CHANNEL_HOSTS.TSChannels,
    TSMonkeys: EMOTE_MAIN_HOSTS.TSMonkeys,

    BTTVGlobals: EMOTE_MAIN_HOSTS.BTTVGlobals,
    BTTVChannels: EMOTE_CHANNEL_HOSTS.BTTVChannels,

    FFZGlobals: EMOTE_MAIN_HOSTS.FFZGlobals,
    FFZChannels: EMOTE_CHANNEL_HOSTS.FFZChannels
};

function generateEmote(emoteName, emoteURL, emoteChannel) {
    return 'img class="GTEEmote" data-gtenode="true" title="' + emoteName + '" alt="' + emoteName + '" src="' + emoteURL + '" data-GTEChannel="' + emoteChannel + '"';
}

if (typeof exports === 'object') {
    exports.EMOTE_HOSTS = EMOTE_HOSTS;
}

return {
    EMOTE_HOSTS: EMOTE_HOSTS
};

}());