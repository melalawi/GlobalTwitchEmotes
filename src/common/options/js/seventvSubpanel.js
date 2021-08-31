var $ = require('jquery');


function init() {
    $('#seventvChannelsList').EditableTable({
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