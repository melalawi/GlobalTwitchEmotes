var pageObserver = require('./pageObserver');


const MAX_EMOTE_PARSES_PER_ITERATION = 100;
const COUNTER_UPDATE_COOLDOWN = 2000;
const EMOTE_CSS = 'display:inline !important;height:auto !important;width:auto !important;max-height:100% !important;max-width:auto !important;opacity:1 !important;outline:0 !important;border:0 !important;margin:0 !important;padding:0 !important;z-index:auto !important;visibility:visible !important;';
const TIPSY_DATA_ATTRIBUTE = 'gte-tipsy-text';
const KAPPER_SHARED_TOOLTIP_TEXT = ':full_moon_with_face:';
const KAPPA_IMAGE_URL = 'https://static-cdn.jtvnw.net/emoticons/v1/25/1.0';

var counterUpdateCallback;
var emoteCount = 0;

var startNodeID = 0;
var pendingIDToNodesMapping = new Map();
var pendingNodesToIDsMapping = new Map();
var pendingEmoteParses = [];

var messageClient;


function runParser(client) {
    messageClient = client;

    setInterval(applyEmoteSearchResults, 1);

    pageObserver.onIframeFound(notifyBackgroundOnNewIframe);
    pageObserver.observe(extractAndSendText);
}

// Detects if we are running this instance in an iframe or not
function isInIframe() {
    try {
        return window.self !== window.top;
    } catch (e) {
        return true;
    }
}

function notifyBackgroundOnNewIframe() {
    messageClient.messageBackground({
        header: 'iframeFound',
        payload: null
    });
}

function replaceKappers() {
    pageObserver.onImageFound(replaceKapperWithKappa);
}

function replaceKapperWithKappa(imageNode) {
    if (/youtube.com/i.test(window.location.href) && imageNode.getAttribute('shared-tooltip-text') === KAPPER_SHARED_TOOLTIP_TEXT) {
        var emoteKey = 'Kapper';

        imageNode.setAttribute('class', 'GTEEmote');
        imageNode.setAttribute('src', KAPPA_IMAGE_URL);
        imageNode.setAttribute('title', emoteKey);
        imageNode.setAttribute(TIPSY_DATA_ATTRIBUTE, generateTipsyAlt(emoteKey, ''));
        imageNode.setAttribute('alt', emoteKey);
        imageNode.style.cssText = EMOTE_CSS;
    }
}

function onBackgroundMessage(message) {
    if (message.header === 'emoteSearchResults') {
        processEmoteSearchResults(message.payload.id, message.payload.foundEmotes);
    }
}

function extractAndSendText(node) {
    var nodeText = node.nodeValue;
    var currentID = startNodeID++;

    // Need to map both ways to properly detect if a single node changed within the course of the search
    // Necessary because you cannot message nodes to background script
    pendingIDToNodesMapping.set(currentID, node);
    pendingNodesToIDsMapping.set(node, currentID);

    messageClient.messageBackground({
        header: 'searchTextForEmotes',
        payload: {
            id: currentID,
            text: nodeText
        }
    });
}

function processEmoteSearchResults(id, foundEmotes) {
    var matchingNode = pendingIDToNodesMapping.get(id);
    var resultsAreValid = pendingNodesToIDsMapping.get(matchingNode) === id;

    // If the ID doesn't match the node, then the node has been changed recently. These results must unfortunately be thrown out.
    if (foundEmotes.length > 0 && resultsAreValid === true) {
        pendingEmoteParses.push({
            node: matchingNode,
            processedIndex: 0,
            lastIndex: 0,
            lastLength: 0,
            foundEmotes: foundEmotes
        });
    }

    if (resultsAreValid === false) {
        console.log('Results discarded!');
    }

    pendingIDToNodesMapping.delete(id);
}


function applyEmoteSearchResults() {
    var emotesParsedThisIteration = 0;

    outerLoop: for (var i = pendingEmoteParses.length - 1; i >= 0; --i) {
        var parseSet = pendingEmoteParses[i];

        for (var j = parseSet.processedIndex; j < parseSet.foundEmotes.length; ++j) {
            if (emotesParsedThisIteration === MAX_EMOTE_PARSES_PER_ITERATION) {
                break outerLoop;
            }

            var currentIndex = parseSet.foundEmotes[j].index;

            currentIndex -= parseSet.lastIndex + parseSet.lastLength;

            parseSet.lastIndex = parseSet.foundEmotes[j].index;
            parseSet.lastLength = parseSet.foundEmotes[j].emote.length;

            try {
                parseSet.node = parseEmoteString(parseSet.node, currentIndex, parseSet.foundEmotes[j].emote, parseSet.foundEmotes[j].channel, parseSet.foundEmotes[j].url, parseSet.foundEmotes[j].emoji);
            } catch (e) {
                console.error(e);
            } finally {
                parseSet.processedIndex++;
                emotesParsedThisIteration++;
            }
        }

        pendingNodesToIDsMapping.delete(parseSet.node);
        pendingEmoteParses.splice(i, 1);
    }
}

function parseEmoteString(node, index, emoteKey, emoteChannel, emoteURL, unicodeEmoji) {
    var parent = node.parentNode;
    var nodeText = node.nodeValue;
    var postEmoteTextNode = null;
    var emoteNode;

    if (parent === null) {
        return;
    }

    emoteNode = emoteURL ? createEmoteImage(emoteKey, emoteChannel, emoteURL) : createUnicodeEmoji(emoteKey, emoteChannel, unicodeEmoji);

    console.log('Emote ' + emoteKey + ' found at index ' + index);

    node.isGTENode = true;

    parent.insertBefore(emoteNode, node.nextSibling);

    // Checks for and arranges text after the new emote
    if (index + emoteKey.length < nodeText.length) {
        postEmoteTextNode = document.createTextNode(nodeText.substring(index + emoteKey.length));

        postEmoteTextNode.isGTENode = true;

        parent.insertBefore(postEmoteTextNode, emoteNode.nextSibling);
    }

    // If there's no text before the new emote, remove it
    if (index === 0) {
        parent.removeChild(node);
    } else {
        node.nodeValue = nodeText.substring(0, index);
    }

    onNewEmote();

    return postEmoteTextNode;
}

function createEmoteImage(emoteKey, emoteChannel, emoteURL) {
    var emote = document.createElement('img');

    emote.setAttribute('class', 'GTEEmote');
    emote.setAttribute('src', emoteURL);
    emote.setAttribute('title', emoteKey);
    emote.setAttribute(TIPSY_DATA_ATTRIBUTE, generateTipsyAlt(emoteKey, emoteChannel));
    emote.setAttribute('alt', emoteKey);
    emote.style.cssText = EMOTE_CSS;

    return emote;
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

function createUnicodeEmoji(emoteKey, emoteChannel, unicodeEmoji) {
    var emote = document.createElement('div');

    emote.setAttribute('class', 'GTEEmote');
    emote.setAttribute('title', emoteKey);
    emote.setAttribute(TIPSY_DATA_ATTRIBUTE, generateTipsyAlt(emoteKey, emoteChannel));
    emote.setAttribute('alt', emoteKey);
    emote.style.cssText = EMOTE_CSS;
    emote.innerText = unicodeEmoji;

    return emote;
}

function onNewEmote() {
    emoteCount++;

    clearTimeout(counterUpdateCallback);
    counterUpdateCallback = setTimeout(updateCounter, COUNTER_UPDATE_COOLDOWN);
}

function updateCounter() {
    if (isInIframe() === false) {
        messageClient.messageBackground({
            header: 'setBadgeText',
            payload: emoteCount
        });
    }
}


module.exports = {
    run: runParser,
    onBackgroundMessage: onBackgroundMessage,
    replaceKappers: replaceKappers
};