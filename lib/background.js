var GTE_BACKGROUND = (function () {

"use strict";

var self = this,
    Deferred,
    GTE_PARSER;

//non-firefox
//don't like this solution
function generateManager(Def, parser, adaptor) {
    Deferred = Def;
    GTE_PARSER = parser;

    return new Manager(adaptor);
}

var TAB_SCRIPTS = {
    js: ['js/jquery-2.1.4.min.js', 'js/jquery.tipsy.js', 'js/script.js'],
    css: ['css/gte.css']
};

const LOCAL_URL_IDENTIFIER = 'LOCAL_URL/';

const HOSTS = ['TEGlobals', 'TEChannels', 'TSMonkeys', 'TSChannels', 'TSChannelsList', 'BTTVGlobals', 'BTTVChannels', 'BTTVChannelsList', 'FFZGlobals', 'FFZChannels', 'FFZChannelsList'];
const OTHER = ['enableDynamicEmotification', 'enableTipsyMode', 'enableHitboxKappa'];

const DEFAULT_SETTINGS = {
    //hosts
    TEGlobals: true,
    TEChannels: false,

    //smilies
    TSChannels: false,
    TSMonkeys: false,
    TSChannelsList: [{channel: 'Robot'}],//entry: {channel: *channelName*}

    BTTVGlobals: false,
    BTTVChannels: false,
    BTTVChannelsList: [],//entry: {channel: *channelName*}

    FFZGlobals: false,
    FFZChannels: false,
    FFZChannelsList: [],//entry: {channel: *channelName*}

    //filters
    emoteFilterMode: 'Blacklist',
    emoteFilterList: [],//entry: {host: TE, FFZ, BTTV, type: 'emote' or 'channel', name: *emote or channel name*}

    webFilterMode: 'Blacklist',
    webFilterList: [],//entry: {url: *site url*}

    //other

    enableLocalStorage: false,
    enableDynamicEmotification: true,
    enableTipsyMode: true,
    enableHitboxKappa: false
};

const MESSAGES = {
    LOAD_SETTINGS: 'load',
    SAVE_SETTINGS: 'saveAll',
    RESET_SETTINGS: 'reset'
};

function Manager(browserAdaptor) {
    var backendManager,
        adaptor = browserAdaptor,
        emotesReady = new Deferred.Deferred();

    emotesReady.then(pushEmotes);

    this.initialize = function() {
        TAB_SCRIPTS.js.push(adaptor.scriptFile);

        backendManager = new BackendManager(adaptor);
        backendManager.initializeBackend(emotesReady);

        //listen to tabs
        adaptor.messageListener(messageHandler);
    };

    function messageHandler(tab, message, data, responseCallback) {
        switch (message) {
            case MESSAGES.LOAD_SETTINGS:
                responseCallback(backendManager.getSettings());
                break;
            case MESSAGES.SAVE_SETTINGS:
                if (backendManager) {
                    var saveConfirmed = new Deferred.Deferred();

                    saveConfirmed.then(function(){
                        adaptor.sendMessage(tab, 'settingsSaved');
                    });

                    backendManager.setSettings(data, saveConfirmed);
                }
                break;
            case MESSAGES.RESET_SETTINGS:
                if (backendManager) {
                    //backendManager.resetData(data);
                }
                break;
            default:
                console.log("Unrecognized content script request: " + message);
            break;
        }
    }

    //sends data to every tab
    function serveTabQueue(queue) {
        for (var index = 0; index < queue.length; ++index) {
            serveTab(queue[index]);
        }
    }

    function serveTab(tab) {
        if (emotesReady.state() === 'resolved') {
            var tabURL = adaptor.getTabURL(tab);

            //just in case, check to make sure url starts with http (chrome isnt good at doing this itself)
            if (tabURL.match(/(^http)/gi) && isValidURL(tabURL)) {
                adaptor.initializeTab(tab, TAB_SCRIPTS, backendManager.getTabData());
            }
        }
    }

    function pushEmotes() {
        adaptor.getLoadedTabs(serveTabQueue);

        adaptor.initializeTabListener(serveTab);
    }

    function isValidURL(tabURL) {
        var found = false,
            filteredURLs = backendManager.getVariable('webFilterList');

        for (var index = 0; index < filteredURLs.length; ++index) {
            //regexify the current URL, replacing all user-provided asterisks with the appropriate wildcard function
            //if no wildcards are present, match the exact url only
            var urlRegex = generateURLRegex(filteredURLs[index].url);

            if (tabURL.match(urlRegex)) {
                found = true;
                break;
            }
        }

        //no urls listed + whitelist mode set should return every url as valid
        return filteredURLs.length === 0 || found === (backendManager.getVariable('webFilterMode') === 'Whitelist');
    }
}

function BackendManager(browserAdaptor) {
    var adaptor = browserAdaptor,
        extensionStorage = new ExtensionStorage(DEFAULT_SETTINGS);

    //Loads settings via the provided adaptor, then goes on to load emoticons
    this.initializeBackend = function(deferred) {
        if (!adaptor) {
            throw "Error in BackendManager: Incompatible Adaptor";
        } else {
            adaptor.storageLoad(function(loadedSettings){
                initializeSettings(loadedSettings, deferred);
            });
        }
    };

    //loading options page, for instance
    this.getSettings = function() {
        return extensionStorage.getExtensionSettings();
    };

    //individual variables
    this.getVariable = function(varName) {
        return extensionStorage.getVariable(varName);
    };

    //saving changed options: sanitize, store, reparse changes
    this.setSettings = function(newSettings, deferred) {
        extensionStorage.setExtensionSettings(newSettings);

        adaptor.storageSave(extensionStorage.getExtensionSettings());

        buildEmoticons(extensionStorage.getExtensionSettings(), deferred);
    };

    this.getTabData = function() {
        return extensionStorage.getTabData();
    };

    //on startup only
    function initializeSettings(loadedSettings, deferred) {
        extensionStorage.setExtensionSettings(loadedSettings);

        buildEmoticons(extensionStorage.getExtensionSettings(), deferred);
    }

    //parses emoticons off the desired hosts
    function buildEmoticons(userSettings, onComplete) {
        var emoteHosts = getSelectedSettings(userSettings, HOSTS),
            deferredArray = [];

        extensionStorage.resetEmotes();

        //loop through changed hosts, parsing only the ones desired by the user
        //concatenates deferred arrays (some hosts have multiple, user-defined channels)
        for (var hostName in emoteHosts) {
            if (emoteHosts.hasOwnProperty(hostName)) {
                var desired = emoteHosts[hostName];

                //better solution needed
                if (hostName === 'TSMonkeys' && emoteHosts.TSChannels === false) {
                    desired = false;
                }

                if (desired === true) {
                    //some hosts such as FFZChannels require a list of channels defined by the user
                    var channelList = emoteHosts[hostName + 'List'];

                    deferredArray.push.apply(deferredArray, buildFromHost(hostName, channelList));
                }
            }
        }

        //on first time only
        Deferred.when(deferredArray, function(){
            onComplete.resolve(extensionStorage.getTabData());
        });
    }

    //parses a single host's emotes
    //if this host has a list of channels
    function buildFromHost(hostName, channelList) {
        var currentHost = GTE_PARSER.EMOTE_HOSTS[hostName],
            deferredArray = [],
            nextDeferred,
            nextChannelSet;

        //if this specific host exists, create an emoteset (or emotesets depending on whether or not channelList exists)
        if (currentHost) {

            //if this host comes with a list of user-defined channels
            if (channelList) {
                //loop through every channel, creating an emoteset of each
                for (var listIndex = 0; listIndex < channelList.length; ++listIndex) {
                    nextDeferred = new Deferred.Deferred();
                    nextChannelSet = new EmoteSet(currentHost, nextDeferred, adaptor, manageGeneratedCollection);

                    extensionStorage.addEmoteSet(nextChannelSet, hostName, channelList[listIndex]);

                    deferredArray.push(nextDeferred);
                    nextChannelSet.initialize(channelList[listIndex].channel);
                }
            } else {
                nextDeferred = new Deferred.Deferred();
                nextChannelSet = new EmoteSet(currentHost, nextDeferred, adaptor, manageGeneratedCollection);

                extensionStorage.addEmoteSet(nextChannelSet, hostName, 'globals');

                deferredArray.push(nextDeferred);
                nextChannelSet.initialize();
            }
        }

        return deferredArray;
    }

    //called by generated EmoteSets
    //filters out unwanted emotes (decided by user), then stores them properly
    function manageGeneratedCollection(emoteCollection) {
        if (emoteCollection) {
            var list = extensionStorage.getVariable('emoteFilterList'),
                channelFilterList = list.filter(function (filterRule) {
                    return filterRule.type === 'channel';
                }),
                emoteFilterList = list.filter(function (filterRule) {
                    return filterRule.type === 'emote';
                }),
                filterMode = extensionStorage.getVariable('emoteFilterMode'),
                channelRuleFound = false;

            //loop through each set of rules
            if (emoteCollection.channel) {
                //if channels match, we're done here. Either add all its emotes, or add none depending on filterMode
                for (var index = 0; index < channelFilterList.length; ++index) {
                    var currentRule = channelFilterList[index];

                    //check if hosts match first
                    if (currentRule.host === emoteCollection.host) {
                        var ruleChannel = currentRule.name.toUpperCase();

                        //channel = found
                        if (ruleChannel === emoteCollection.channel.toUpperCase()) {
                            channelRuleFound = true;
                            //allow everything if channel is whitelisted
                            if (filterMode === 'Whitelist') {
                                extensionStorage.addRawEmotes(emoteCollection.host, emoteCollection.emotes);
                            }

                            break;
                        }
                    }
                }
            }

            //no channel match found. Check each emote.
            if (channelRuleFound === false) {
                for (var i = 0; i < emoteCollection.emotes.length; ++i) {
                    var found = false,
                        currentEmoteName = emoteCollection.emotes[i].emoteName.toUpperCase();

                    for (var j = 0; j < emoteFilterList.length; ++j) {
                        if (emoteFilterList[j].host === emoteCollection.host) {
                            var ruleEmoteName = emoteFilterList[j].name.toUpperCase();

                            if (ruleEmoteName === currentEmoteName) {
                                found = true;
                                break;
                            }
                        }
                    }

                    //if its set to whitelist mode and the list is empty, DON'T ignore everything
                    if (list.length === 0 || found === (filterMode === 'Whitelist')) {
                        extensionStorage.addRawEmotes(emoteCollection.host, [emoteCollection.emotes[i]]);
                    }
                }
            }

        }
    }

    //used to extract desired settings only
    function getSelectedSettings(settings, array) {
        var result = {};

        for (var index = 0; index < array.length; ++index) {
            result[array[index]] = settings[array[index]];
        }

        return result;
    }
}

function ExtensionStorage(defSettings) {
    var defaultSettings = defSettings,
        extensionData = {
            settings: {},
            rawEmotes: {},
            emoteSets: {}
        };

    //returns the difference between the existing settings and the new settings
    this.setExtensionSettings = function(newSettings) {
        var difference = {};

        newSettings = sanitizeSettings(newSettings);

        //iterate through data, only preserving variables that exist in the default as well
        for (var key in newSettings) {
            if (newSettings.hasOwnProperty(key)) {
                if (extensionData.settings[key] !== newSettings[key]) {
                    difference[key] = newSettings[key];
                }
            }
        }

        extensionData.settings = newSettings;

        return difference;
    };

    this.resetEmotes = function() {
        extensionData.emoteSets = {};
        extensionData.rawEmotes = {};
    };

    //retrieve everything a tab needs to work
    this.getTabData = function() {
        return {settings: extensionData.settings, emotes: extensionData.rawEmotes};
    };

    //accessors
    this.getRawEmotes = function() { return extensionData.rawEmotes; };
    this.getEmoteSets = function() { return extensionData.emoteSets; };
    this.getExtensionSettings = function() { return extensionData.settings; };

    this.getExtensionData = function() { return extensionData; };

    this.getVariable = function(varName) {
        return extensionData.settings[varName];
    };

    this.addEmoteSet = function(emoteSet, setName, subsetName) {
        var emoteSetContainer = extensionData.emoteSets;

        if (emoteSetContainer[setName] === undefined) {
            emoteSetContainer[setName] = {};
        }

        emoteSetContainer[setName][subsetName] = emoteSet;
    };

    this.addRawEmotes = function(binName, emotes) {
        if (extensionData.rawEmotes[binName] === undefined) {
            extensionData.rawEmotes[binName] = {};
        }

        for (var index = 0; index < emotes.length; ++index) {
            extensionData.rawEmotes[binName][emotes[index].emoteName] = emotes[index].emoteData;
        }
    };

    //called on initiation and whenever settings are changed,
    //makes sure that any provided data adheres to expected format DEFAULT_SETTINGS
    function sanitizeSettings(data) {
        var newSettings = {};

        //iterate through data, only preserving variables that exist in the default as well
        for (var key in defaultSettings) {
            if (defaultSettings.hasOwnProperty(key)) {
                newSettings[key] = data !== null && typeof data[key] === typeof defaultSettings[key] ? data[key] : defaultSettings[key];
				
				// 1.0.1015 fix for blank input (really bad please refactor)
				if (Array.isArray(newSettings[key])) {
					for (var i = 0; i < newSettings[key].length; ++i) {
						var currMember = newSettings[key][i];
						var keyName;
						
						if (key.indexOf('ChannelsList') !== -1) {
							keyName = 'channel';
						} else if (key.indexOf('webFilterList') !== -1){
							keyName = 'url';
						} else {
							keyName = 'name';
						}
						
						if (currMember[keyName] === '') {
							console.log('splice');
							newSettings[key].splice(newSettings[key].indexOf(newSettings[key][i]), 1);
							--i;
						}
					}
				}
            }
        }

        return newSettings;
    }
}

function EmoteSet(emoteHostObject, deferred, browserAdaptor, filterCallback) {
    var hostObject = emoteHostObject,
        onComplete = deferred,
        filter = filterCallback,
        adaptor = browserAdaptor,
        channel;

    this.initialize = function(channelName) {
        channel = channelName;

        retrieveJSON();
    };

    function retrieveJSON() {
        var setURL;

        setURL = hostObject.getBaseURL(channel);

        //is it a local file?
        if (setURL.match(LOCAL_URL_IDENTIFIER)) {
            setURL = adaptor.localDirectory(setURL.replace(LOCAL_URL_IDENTIFIER, ''));
        }

        //onerror: keep trying with this host, but 'resolve' the deferred in order to keep things moving
        adaptor.XMLRequest(setURL, parseResponse, function(){
            onComplete.resolve();

            setTimeout(function() { retrieveJSON(channel); }, 5000);
        });
    }

    function parseResponse(responseText) {
        hostObject.parse(JSON.parse(responseText), filter, channel);

        onComplete.resolve();
    }
}

function generateURLRegex(url) {
    var regex = url;

    //remove any needless slashes
    regex = regex.replace(/\/+$/, '');

    //escape any regex problem characters (except asterisk)
    regex = regex.replace(/[\-\[\]\/\{\}\(\)\+\?\.\\\^\$\|]/g, '\\$&');

    //if the http specifier does not exist at the start of the url, append it and the wildcard. Otherwise, append startsWith function
    if (regex.indexOf('http') !== 0) {
        regex = '^http*' + regex;
    } else {
        regex = '^' + regex;
    }

    //replace any asterisks with the appropriate wildcard function
    regex = regex.replace(/\*/g, '.*?');

    //generate regex
    regex = new RegExp(regex, 'i');

    return regex;
}

/*************************************/
//in order to bridge communications between background pages in firefox, the addon-sdk utilizes the predefined 'exports' object
//only the functions defined in exports can be 'exported' and used in the other background scripts
//'exports' does not exist in chrome, however, and as a result attempting to call it in chrome will result in a crash
//coupling... levels... rising

//if exports exists, define the background manager that will be accessed in firefoxBackground.js
if (typeof exports === 'object') {
    Deferred = require('lib/deferred');
    GTE_PARSER = require('lib/emoteParser');

    exports.generateManager = function(adaptor) {
        return new Manager(adaptor);
    };
}

/*************************************/


return {
    generateManager: generateManager
};



//module namespace
}());