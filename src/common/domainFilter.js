var browserBackend = require('./browserBackend');


var FORBIDDEN_TWITCH_DOMAIN = 'twitch.tv';
var IS_VALID_URL_REGEX = /^(http|https|ftp)/i;
var PROTOCOL_REMOVAL_REGEX = /^(?:\w+:\/\/)?(?:www\.)?([^\s\/]+(?:\/[^\s\/]+)*)\/*$/i;
var HOSTNAME_EXTRACTION_REGEX = /^(?:\w+:\/\/)?(?:www\.)?([^\\\/]*)/i;


function isFiltered(address, extensionSettings) {
    var result = isURLIllegal(address);

    if (result === false && extensionSettings.domainFilterList.length > 0) {
        result = (getFilteredRule(address, extensionSettings.domainFilterList) !== null) === (extensionSettings.domainFilterMode === 'Whitelist');
        result = !result;
    }

    return result;
}

function getFilteredRule(address, filteredURLs) {
    var result = null;

    if (address) {
        var url = removeProtocolFromAddress(address);

        for (var i = 0; i < filteredURLs.length; ++i) {
            var domainRegex = createRegexFromRule(filteredURLs[i]);

            if (domainRegex !== null && domainRegex.test(url) === true) {
                result = filteredURLs[i];
                break;
            }
        }
    }

    return result;
}

function isURLIllegal(address) {
    var result = true;

    if (address && IS_VALID_URL_REGEX.test(address)) {
        var url = removeProtocolFromAddress(address);

        result = url.indexOf(FORBIDDEN_TWITCH_DOMAIN) === 0;

        if (result === false) {
            for (var i = 0; i < browserBackend.forbiddenDomains.length; ++i) {
                if (url.indexOf(browserBackend.forbiddenDomains[i]) === 0) {
                    result = true;
                    break;
                }
            }
        }
    }

    return result;
}

function createRegexFromRule(rule) {
    var result = removeProtocolFromAddress(rule || '');

    result = new RegExp('^' + replaceCharactersWithRegexNotation(result) + '$', 'i');

    return result;
}

function replaceCharactersWithRegexNotation(input) {
    var result = input || '';

    result = result.trim();
    result = result.replace(/\s+/g, '%20');
    result = result.replace(/\\/g, '/');
    result = result.replace(/\/\*/g, '*');
    result = result.replace(/\*+/g, '*');
    result = result.replace(/\*/g, '.*');

    return result;
}

function removeProtocolFromAddress(address) {
    return PROTOCOL_REMOVAL_REGEX.test(address) ? PROTOCOL_REMOVAL_REGEX.exec(address)[1] : address;
}

function extractDomainFromAddress(address) {
    return HOSTNAME_EXTRACTION_REGEX.test(address) ? HOSTNAME_EXTRACTION_REGEX.exec(address)[1] : address;
}

module.exports = {
    isFiltered: isFiltered,
    getFilteredRule: getFilteredRule,
    isURLIllegal: isURLIllegal,
    removeProtocolFromAddress: removeProtocolFromAddress,
    extractDomainFromAddress: extractDomainFromAddress
};