var filterMode;
var filteredEmotesCount;
var filteredEmotes = {
    twitch: [],
    bttv: [],
    ffz: [],
    seventv: []
};

function initialize(mode, emotes) {
    filterMode = mode;
    filteredEmotesCount = emotes.length;

    for (var i = 0; i < emotes.length; ++i) {
        if (emotes[i].set === 'Twitch.tv') {
            filteredEmotes.twitch.push(emotes[i]);
        } else if (emotes[i].set === 'BetterTTV') {
            filteredEmotes.bttv.push(emotes[i]);
        } else if (emotes[i].set === 'FrankerFaceZ') {
            filteredEmotes.ffz.push(emotes[i]);
        } else if (emotes[i].set === '7TV') {
            filteredEmotes.seventv.push(emotes[i]);
        } else {
            console.error('Unrecognized emote filter set "' + emotes[i].set + '".');
        }
    }
}

function isEmoteAllowed(set, emote) {
    var result = true;

    if (filteredEmotesCount > 0) {
        var matchingRule = getMatchingFilterRule(set, emote);

        result = matchingRule === null;

        if (filterMode === 'Whitelist') {
            result = !result;
        }
    }

    return result;
}

function getMatchingFilterRule(set, emote) {
    var potentialRules = getMatchingFilterSet(set);
    var rule = null;

    for (var i = 0; i < potentialRules.length; ++i) {
        var currentRule = potentialRules[i];

        if (currentRule.value === emote) {
            rule = currentRule;
            break;
        }
    }

    return rule;
}

function getMatchingFilterSet(emoteSet) {
    var result = filteredEmotes.twitch;

    if (emoteSet.indexOf('bttv') === 0) {
        result = filteredEmotes.bttv;
    } else if (emoteSet.indexOf('ffz') === 0) {
        result = filteredEmotes.ffz;
    } else if (emoteSet.indexOf('seventv') === 0) {
        result = filteredEmotes.seventv;
    }

    return result;
}


module.exports = {
    initialize: initialize,
    isEmoteAllowed: isEmoteAllowed
};