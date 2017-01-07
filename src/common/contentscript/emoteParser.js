'use strict';
var pageObserver = require('./pageObserver');


var COUNTER_UPDATE_COOLDOWN = 1000;
var EMOTE_CSS = 'display:inline !important;height:auto !important;width:auto !important;max-height:100% !important;max-width:auto !important;opacity:1 !important;outline:0 !important;border:0 !important;margin:0 !important;padding:0 !important;z-index:auto !important;visibility:visible !important;';
var STRING_SEPARATOR = /([\w]|[:;)(\\\/<>73#\|\]])+/g;
var TIPSY_DATA_ATTRIBUTE = 'gte-tipsy-text';
var counterUpdateCallback;
var emoteLibrary;
var emoteFilterMode;
var emoteCount = 0;
var newEmoteParsedCallback;


function runParser(extensionEmotes, extensionSettings) {
    emoteLibrary = extensionEmotes;

    emoteFilterMode = extensionSettings.emoteFilterList.length === 0 ? 'AllowAll' : extensionSettings.emoteFilterMode;

    pageObserver.observe(searchAndParseEmoteStrings);
}

function searchAndParseEmoteStrings(node) {
    var nodeText = node.nodeValue;
    var currentNode = node;

    var nextWord;

    wordsInNodeLoop: while ((nextWord = STRING_SEPARATOR.exec(nodeText)) !== null) {
        var emote = nextWord[0];

        emoteLookupLoop: for (var host in emoteLibrary) {
            if (emoteLibrary.hasOwnProperty(host)) {
                var allEmotes = emoteLibrary[host];

                if (allEmotes.hasOwnProperty(emote)) {
                    var emoteData = allEmotes[emote];

                    if (emoteFilterMode === 'AllowAll' || ((emoteFilterMode === 'Blacklist') !== emoteData.hasOwnProperty('filtered'))) {
                        // Reset the regex BEFORE continuing in order to make sure other nodes are checked properly
                        STRING_SEPARATOR.lastIndex = 0;

                        currentNode = parseEmoteString(currentNode, nextWord.index, emote, emoteData.channel, emoteData.url);

                        if (currentNode == null || currentNode.nodeValue.length < 2) {
                            break wordsInNodeLoop;
                        }

                        break emoteLookupLoop;
                    }
                }
            }
        }

        nodeText = currentNode.nodeValue;
    }
}

function parseEmoteString(node, index, emoteKey, emoteChannel, emoteURL) {
    var parent = node.parentNode;
    var nodeText = node.nodeValue;
    var emoteNode = createEmote(emoteKey, emoteChannel, emoteURL);
    var postEmoteTextNode = null;

    if (parent === null) {
        return;
    }

    node.isGTENode = true;

    parent.insertBefore(emoteNode, node.nextSibling);

    // Checks for and arranges text after the new emote
    if (index + emoteKey.length < nodeText.length) {
        postEmoteTextNode = document.createTextNode(nodeText.substring(index + emoteKey.length));

        postEmoteTextNode.isGTENode = true;

        parent.insertBefore(postEmoteTextNode, emoteNode.nextSibling);
    }

    // If there's no text before the new emote, remove it TODO no text after emote remove
    if (index === 0) {
        parent.removeChild(node);
    } else {
        node.nodeValue = nodeText.substring(0, index);
    }

    onNewEmote();

    return postEmoteTextNode;
}

function createEmote(emoteKey, emoteChannel, emoteURL) {
    var emote = document.createElement('img');

    emote.setAttribute('class', 'GTEEmote');
    emote.setAttribute('src', emoteURL);
    emote.setAttribute('title', emoteKey);
    emote.setAttribute(TIPSY_DATA_ATTRIBUTE, generateTipsyAlt(emoteKey, emoteChannel));
    emote.setAttribute('alt', emoteKey);
    emote.style.cssText = EMOTE_CSS;

    return emote;
}

function onNewEmote() {
    emoteCount++;

    if (counterUpdateCallback) {
        clearTimeout(counterUpdateCallback);
    }

    counterUpdateCallback = setTimeout(newEmoteParsedCallback, COUNTER_UPDATE_COOLDOWN);
}

function generateTipsyAlt(emoteKey, emoteChannel) {
    var result;

    if (emoteChannel === 'FrankerFaceZ Emote' || emoteChannel === 'BetterTTV Emote' || emoteChannel === 'Custom GTE Emote') {
        result = 'Emote: ' + emoteKey + '\n' + emoteChannel;
    } else if (emoteChannel !== '') {
        result = 'Emote: ' + emoteKey + '\n' + 'Channel: ' + emoteChannel;
    } else {
        result = emoteKey;
    }

    return result;
}

function onNewEmoteParsed(callback) {
    newEmoteParsedCallback = callback;
}

function getEmoteCount() {
    return emoteCount;
}

module.exports = {
    run: runParser,
    onNewEmoteParsed: onNewEmoteParsed,
    getEmoteCount: getEmoteCount
};