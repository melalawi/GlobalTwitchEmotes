'use strict';
var $ = require('jquery');
require('./editableTable')($);


var table;


function init() {
    table = $('#bttvChannelList').EditableTable({
        columns: [
            {
                name: 'name',
                displayName: 'Channels',
                type: 'text',
                placeholder: 'Insert Channel Name here...'
            }
        ]
    });

    /*table.EditableTable('importData', [
        {
            name: 'Insentience'
        },
        {
            name: 'ph34rm3333'
        }
    ]);

    console.log(JSON.stringify(table.EditableTable('exportData')));*/
}

module.exports = {
    init: init
};