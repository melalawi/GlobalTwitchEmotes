'use strict';
var $ = require('jquery');
require('./editableTable')($);


var emoteFilterListTable;
var domainFilterListTable;


function init() {
    buildDomainFilterListTable();
    buildEmoteFilterListTable();
}

function buildEmoteFilterListTable() {
    emoteFilterListTable = $('#emoteFilterList').EditableTable({
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
                    console.log('trigger: ' + row + ' ' + value);
                    if (value === 'Channel') {
                        row.find('td.channel input').prop('disabled', false);
                        row.find('td.emote input').prop('disabled', true);
                    } else {
                        row.find('td.channel input').prop('disabled', true);
                        row.find('td.emote input').prop('disabled', false);
                    }
                }
            },
            {
                name: 'channel',
                displayName: '',
                type: 'text',
                placeholder: 'Channel Name'
            },
            {
                name: 'emote',
                displayName: '',
                type: 'text',
                placeholder: 'Emote Name'
            }
        ]
    });
}

function buildDomainFilterListTable() {
    domainFilterListTable = $('#domainFilterList').EditableTable({
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