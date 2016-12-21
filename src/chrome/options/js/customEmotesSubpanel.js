'use strict';
var $ = require('jquery');


var $table;


function init() {
    $table = $('#customEmotesList').EditableTable({
        columns: [
            {
                name: 'key',
                displayName: 'Name',
                type: 'text',
                placeholder: 'Emote name'
            },
            {
                name: 'url',
                displayName: 'Image',
                type: 'emote'
            }
        ]
    });
}

module.exports = {
    init: init
};