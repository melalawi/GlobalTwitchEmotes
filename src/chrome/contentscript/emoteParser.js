'use strict';
var pageObserver = require('./pageObserver');
var Tipsy = require('./tipsy/tipsy.js');


var EMOTE_CSS = 'display:inline !important;max-height:32px !important;max-width:32px !important;height:auto !important;width:auto !important;opacity:1 !important;outline:0 !important;border:0 !important;margin:0 !important;padding:0 !important;z-index:auto !important;visibility:visible !important;';
var STRING_SEPARATOR = /([\w]|[:;)(\\\/<>73#\|\]])+/g;
var emoteLibrary;
var emoteFilterMode;
var useTipsy;


function runParser(extensionEmotes, extensionSettings) {
    emoteLibrary = extensionEmotes;

    emoteFilterMode = extensionSettings.emoteFilterList.length === 0 ? 'AllowAll' : extensionSettings.emoteFilterMode;
    useTipsy = extensionSettings.twitchStyleTooltips;

    pageObserver.observe(searchAndParseEmoteStrings);
}

function searchAndParseEmoteStrings(node) {
    var nodeText = node.nodeValue;

    var nextWord;

    wordLoop: while ((nextWord = STRING_SEPARATOR.exec(nodeText)) !== null) {
        var emote = nextWord[0];

        for (var host in emoteLibrary) {
            if (emoteLibrary.hasOwnProperty(host)) {
                var allEmotes = emoteLibrary[host];

                if (allEmotes.hasOwnProperty(emote)) {
                    var emoteData = allEmotes[emote];

                    if (emoteFilterMode === 'AllowAll' || ((emoteFilterMode === 'Blacklist') !== emoteData.hasOwnProperty('filtered'))) {
                        // Reset the regex BEFORE continuing in order to make sure other nodes are checked properly
                        STRING_SEPARATOR.lastIndex = 0;

                        parseEmoteString(node, nextWord.index, emote, emoteData.channel, emoteData.url);

                        break wordLoop;
                    }
                }
            }
        }
    }
}

function parseEmoteString(node, index, emoteKey, emoteChannel, emoteURL) {
    var parent = node.parentNode;
    var nodeText = node.nodeValue;
    var emoteNode = createEmote(emoteKey, emoteChannel, emoteURL);
    var nextNode;

    if (parent === null) {
        return;
    }

    parent.insertBefore(emoteNode, node.nextSibling);

    // Checks for and arranges text after the new emote
    if (index + emoteKey.length < nodeText.length) {
        nextNode = document.createTextNode(nodeText.substring(index + emoteKey.length));

        parent.insertBefore(nextNode, emoteNode.nextSibling);
    }

    // If there's no text before the new emote, remove it TODO no text after emote remove
    if (index === 0) {
        parent.removeChild(node);
    } else {
        node.nodeValue = nodeText.substring(0, index);
    }
}

function createEmote(emoteKey, emoteChannel, emoteURL) {
    var emote = document.createElement('img');
    var altText = emoteKey;

    emote.setAttribute('src', emoteURL);
    emote.setAttribute('title', emoteKey);

    if (useTipsy === true) {
        if (emoteChannel) {
            altText = generateTipsyAlt(emoteKey, emoteChannel);
        }

        Tipsy.bind(emote, {
            html: true,
            title: function() {
                return altText;
            }
        });
    }

    emote.style.cssText = EMOTE_CSS;
    emote.setAttribute('alt', emoteKey);

    return emote;
}

function generateTipsyAlt(emoteKey, emoteChannel) {
    var result = 'Emote: ' + emoteKey + '\n';

    if (emoteChannel === 'FrankerFaceZ Emote' || emoteChannel === 'BetterTTV Emote' || emoteChannel === 'Custom GTE Emote') {
        result += emoteChannel
    } else {
        result += 'Channel: ' + emoteChannel;
    }

    return result;
}

module.exports = {
    run: runParser
};