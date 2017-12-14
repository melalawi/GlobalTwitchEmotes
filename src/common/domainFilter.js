var browser = require('./browser');


const IS_VALID_URL_REGEX = /^(http|https|ftp)/i;
const PROTOCOL_REMOVAL_REGEX = /^(?:\w+:\/\/)?(?:www\.)?([^\s\/]+(?:\/[^\s\/]+)*)\/*$/i;
const HOSTNAME_EXTRACTION_REGEX = /^(?:\w+:\/\/)?(?:www\.)?([^\\\/]*)/i;

var filterMode;
var filterList;


function initialize(mode, list) {
    filterMode = mode;
    filterList = list;
}

function isAddressAllowed(address) {
    var result = isURLLegal(address);

    if (result === true && filterList.length > 0) {
        var matchingRule = getMatchingFilterRule(address);

        result = matchingRule === null;

        if (filterMode === 'Whitelist') {
            result = !result;
        }
    }

    return result;
}

function getMatchingFilterRule(address) {
    var result = null;

    if (address) {
        var url = removeProtocolFromAddress(address);

        for (var i = 0; i < filterList.length; ++i) {
            var domainRegex = createRegexFromRule(filterList[i]);

            if (domainRegex !== null && domainRegex.test(url) === true) {
                result = filterList[i];
                break;
            }
        }
    }

    return result;
}

function isURLLegal(address) {
    var result = false;

    if (address) {
        var url = removeProtocolFromAddress(address);

        result = true;

        for (var i = 0; i < browser.forbiddenDomains.length; ++i) {
            if (url.indexOf(browser.forbiddenDomains[i]) === 0) {
                result = false;
                break;
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
    initialize: initialize,
    isAddressAllowed: isAddressAllowed,
    getMatchingFilterRule: getMatchingFilterRule,
    isURLLegal: isURLLegal,
    removeProtocolFromAddress: removeProtocolFromAddress,
    extractDomainFromAddress: extractDomainFromAddress
};