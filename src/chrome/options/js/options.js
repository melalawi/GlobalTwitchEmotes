'use strict';
var pageEvents = require('./pageEvents');
var emotesPanel = require('./emotesAndChannelsPanel');
var filterPanel = require('./filterPanel');


function init() {
    pageEvents.setNavbarEvents();
    pageEvents.setOptionsPanel('general');

    emotesPanel.init();
    emotesPanel.setHostPanel('twitch');

    filterPanel.init();
}


document.addEventListener('DOMContentLoaded', init, false);