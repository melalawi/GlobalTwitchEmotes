var $ = require('jquery');


function init() {
    $('#ffzChannelsList').EditableTable({
        columns: [
            {
                name: 'name',
                displayName: 'Channels',
                type: 'text',
                placeholder: 'Insert Channel Name here...'
            }
        ]
    });
}

module.exports = {
    init: init
};