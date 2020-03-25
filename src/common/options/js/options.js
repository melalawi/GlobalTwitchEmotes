var $ = require('jquery');
require('./tooltips')($);
require('./editableTable')($);

var pageEvents = require('./pageEvents');
var generalPanel = require('./generalPanel');
var emotesPanel = require('./emotesAndChannelsPanel');
var filterPanel = require('./filterPanel');
var settingsInterface = require('./settingsInterface');

function init() {
    setGTag();
    setCopyright();

    generalPanel.init();

    emotesPanel.init();
    emotesPanel.setHostPanel('emojisAndSmilies');

    filterPanel.init();

    $('.tooltipTrigger').Tooltip();

    pageEvents.init();
    pageEvents.setOptionsPanel('general');
    generalPanel.updateStatuses();
    settingsInterface.loadStoredSettingsToPage();
}

function setGTag() {
    window.dataLayer = window.dataLayer || [];
    
    pushGTagArguments('js', new Date());
    pushGTagArguments('config', 'UA-68894405-5');
}

function pushGTagArguments() {
    dataLayer.push(arguments);
}

function setCopyright() {
    $('#copyright').text('© Mo Alawi ' + new Date().getFullYear());
}


document.addEventListener('DOMContentLoaded', init, false);