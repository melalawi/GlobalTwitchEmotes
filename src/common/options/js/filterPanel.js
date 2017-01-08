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
                    'FrankerFaceZ'
                ]
            },
            {
                name: 'type',
                displayName: 'Rule Type',
                type: 'select',
                options: [
                    'Channel',
                    'Emote'
                ],
                onchange: function(row, value) {
                    if (value === 'Channel') {
                        row.find('td.value input').attr('placeholder', 'Channel Name');
                    } else {
                        row.find('td.value input').attr('placeholder', 'Emote Name');
                    }
                }
            },
            {
                name: 'value',
                displayName: '',
                type: 'text',
                placeholder: 'Channel Name'
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