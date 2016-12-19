'use strict';
var pageEvents = require('./pageEvents');
var emotesPanelEvents = require('./emotesPanelEvents');


function init() {
    pageEvents.setNavbarEvents();
    pageEvents.setOptionsPanel('general');

    emotesPanelEvents.init();
    emotesPanelEvents.setHostPanel('twitch');
}


document.addEventListener('DOMContentLoaded', init, false);