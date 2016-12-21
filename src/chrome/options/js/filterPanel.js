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
                name: 'host',
                displayName: 'Host',
                type: 'select',
                options: [
                    'Twitch.tv',
                    'BetterTTV',
                    'FrankerFaceZ'
                ]
            },
            {
                name: 'type',
                displayName: 'Filter Type',
                type: 'select',
                options: [
                    'Channel',
                    'Emote'
                ]
            },
            {
                name: 'value',
                displayName: 'Value',
                type: 'text',
                placeholder: 'Emote or Channel to Filter'
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