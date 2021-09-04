var $ = require('jquery');
require('./editableTable')($);


function init() {
    buildDomainFilterListTable();
    buildEmoteFilterListTable();
}

function buildEmoteFilterListTable() {
    $('#emoteFilterList').EditableTable({
        columns: [
            {
                name: 'set',
                displayName: 'Emote Set',
                type: 'select',
                options: [
                    'Twitch.tv',
                    'BetterTTV',
                    'FrankerFaceZ',
                    '7TV'
                ]
            },
            {
                name: 'value',
                displayName: '',
                type: 'text',
                placeholder: 'Emote Name'
            }
        ]
    });
}

function buildDomainFilterListTable() {
    $('#domainFilterList').EditableTable({
        columns: [
            {
                name: 'name',
                displayName: 'Domains',
                type: 'text',
                placeholder: 'Insert Domain here...'
            }
        ]
    });
}

module.exports = {
    init: init
};
