'use strict';
var $ = require('jquery');


var MAX_EMOTE_SIZE = 1048576;
var $table;
var $emoteBrowser;


function init() {
    $emoteBrowser = $('#emoteBrowser');

    $emoteBrowser.on('change', $emoteBrowser, function(event) {
        if (this.files.length > 0) {
            var image = this.files[0];
            var fileReader = new FileReader();

            fileReader.addEventListener('loadend', function() {
                if (image.size > MAX_EMOTE_SIZE) {
                    this.attr('src', 'null');
                } else {
                    this.attr('src', fileReader.result);
                }
            }.bind(event.data.data('emote')), false);

            fileReader.readAsDataURL(image);
        }
    });

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