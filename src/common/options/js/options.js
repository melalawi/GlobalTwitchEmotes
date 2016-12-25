'use strict';
var $ = require('jquery');
require('./tooltips')($);
require('./editableTable')($);


var pageEvents = require('./pageEvents');
var emotesPanel = require('./emotesAndChannelsPanel');
var filterPanel = require('./filterPanel');
var settingsInterface = require('./settingsInterface');


function init() {
    emotesPanel.init();
    emotesPanel.setHostPanel('twitch');

    filterPanel.init();

    $('.tooltipTrigger').Tooltip();

    settingsInterface.loadStoredSettingsToPage().then(function() {
        pageEvents.init();
        pageEvents.setOptionsPanel('general');
    });
}


document.addEventListener('DOMContentLoaded', init, false);