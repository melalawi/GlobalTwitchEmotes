var $ = require('jquery');
require('./tooltips')($);
require('./editableTable')($);


var pageEvents = require('./pageEvents');
var generalPanel = require('./generalPanel');
var emotesPanel = require('./emotesAndChannelsPanel');
var filterPanel = require('./filterPanel');
var settingsInterface = require('./settingsInterface');


function init() {
    generalPanel.init();

    emotesPanel.init();
    emotesPanel.setHostPanel('twitch');

    filterPanel.init();

    $('.tooltipTrigger').Tooltip();

    settingsInterface.loadStoredSettingsToPage().then(function() {
        generalPanel.updateStatuses();

        pageEvents.init();
        pageEvents.setOptionsPanel('general');
    });
}


document.addEventListener('DOMContentLoaded', init, false);