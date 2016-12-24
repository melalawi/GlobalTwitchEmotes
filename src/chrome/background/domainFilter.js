'use strict';
var FORBIDDEN_DOMAINS = [
    'twitch.tv',
    'chrome.google.com'
];
var VALID_URL_TEST_REGEX = /^(http|https)/i;
var URL_EXTRACTION_REGEX = /^(?:\w+:\/\/)?(?:www\.)?([^\s\/]+(?:\/[^\s\/]+)*)\/*$/i;
var URL_REPLACEMENT_CHARACTERS = {
    '/*': '.*',
    '\\*': '.*',
    '*': '.*',
    '\\': '/',
    ' ': '%20'
};


function isURLFiltered(address, extensionSettings) {
    var isURL = VALID_URL_TEST_REGEX.test(address);
    var result = false;

    if (isURL && URL_EXTRACTION_REGEX.test(address)) {
        var url = URL_EXTRACTION_REGEX.exec(address)[1];

        result = isForbiddenURL(url);

        if (result === false && extensionSettings.domainFilterList.length) {
            var isFiltered = false;

            for (var i = 0; i < extensionSettings.domainFilterList.length; ++i) {
                var domainRegex = createRegexFromRule(extensionSettings.domainFilterList[i]);

                if (domainRegex !== null && domainRegex.test(url) === true) {
                    isFiltered = true;
                    break;
                }
            }

            result = !(isFiltered === (extensionSettings.domainFilterMode === 'Whitelist'));
        }
    }

    return result;
}

function createRegexFromRule(rule) {
    var result = null;

    if (URL_EXTRACTION_REGEX.test(rule)) {
        result = URL_EXTRACTION_REGEX.exec(rule)[1];

        result = result.replace(/\/\*|\\\*|\*|\\|\s/, function(match) {
            return URL_REPLACEMENT_CHARACTERS[match];
        });

        result = new RegExp('^' + result + '$', 'i');
    }

    return result;
}

function isForbiddenURL(url) {
    var result = false;

    for (var i = 0; i < FORBIDDEN_DOMAINS.length; ++i) {
        if (url.indexOf(FORBIDDEN_DOMAINS[i]) !== -1) {
            result = true;
        }
    }

    return result;
}

module.exports = {
    isFiltered: isURLFiltered
};