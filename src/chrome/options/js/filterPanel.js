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
                name: 'name',
                displayName: 'Emote Name',
                type: 'text',
                placeholder: 'Insert Emote Name here...'
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