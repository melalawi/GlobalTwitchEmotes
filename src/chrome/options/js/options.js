'use strict';
var $ = require('jquery');
require('./editableTable')($);

var pageEvents = require('./pageEvents');
var emotesPanel = require('./emotesAndChannelsPanel');
var filterPanel = require('./filterPanel');
var settingsInterface = require('./settingsInterface');


function init() {
    pageEvents.init();
    pageEvents.setOptionsPanel('general');

    emotesPanel.init();
    emotesPanel.setHostPanel('twitch');

    filterPanel.init();

    settingsInterface.loadStoredSettingsToPage();
}


document.addEventListener('DOMContentLoaded', init, false);