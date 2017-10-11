var $ = require('jquery');


function init() {
    $('#twitchChannelsList').EditableTable({
        columns: [
            {
                name: 'name',
                displayName: 'Subscriber Channels',
                type: 'text',
                placeholder: 'Insert Channel Name here...'
            }
        ]
    });
}

module.exports = {
    init: init
};