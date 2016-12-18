'use strict';


var FORBIDDEN_DOMAINS = [
    'twitch.tv',
    'chrome.google.com'
];
var DOMAIN_EXTRACT_REGEX = /^(?:http|https)?\:\/\/(?:www\.|)([^\/:?#]+)(?:[\/:?#]|$)/i;


function isDomainFiltered(address, extensionSettings) {
    var url = ('' + address).toLowerCase();
    var isDomain = DOMAIN_EXTRACT_REGEX.test(url);
    var result = false;

    if (isDomain) {
        var domain = DOMAIN_EXTRACT_REGEX.exec(url)[1];

        result = FORBIDDEN_DOMAINS.indexOf(domain) === -1;
        result = result && (extensionSettings.domainFilterMode === 'Whitelist') === (extensionSettings.domainFilterList.indexOf(domain) !== -1);
    }

    return !result;
}

module.exports = {
    isFiltered: isDomainFiltered
};