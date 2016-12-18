'use strict';
var pageObserver = require('./pageObserver');


var STRING_SEPARATOR = /([\w]|[:;)(\\\/<>73#\|\]])+/g;
var emoteLibrary;


function runParser(extensionEmotes, extensionSettings) {
    emoteLibrary = extensionEmotes;

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

                if (allEmotes.hasOwnProperty(emote) && allEmotes[emote].allowed === true) {
                    var emoteData = allEmotes[emote];

                    // Reset the regex BEFORE continuing in order to make sure other nodes are checked properly
                    STRING_SEPARATOR.lastIndex = 0;

                    parseEmoteString(node, nextWord.index, emote, emoteData.channel, emoteData.url);

                    break wordLoop;
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

    emote.setAttribute('src', emoteURL);
    emote.setAttribute('alt', emoteKey);
    emote.setAttribute('title', emoteKey);

    return emote;
}

module.exports = {
    run: runParser
};