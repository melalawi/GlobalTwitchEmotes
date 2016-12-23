'use strict';
var $ = require('jquery');
var settingsInterface = require('./settingsInterface');
var importExport = require('./importExport');


var SAVE_DELAY_TIMEOUT = 500;
var saveButtons;


function init() {
    setImportExportEvents();
    setNavbarButtonEvents();
    setSaveButtonEvent();
}

function setOptionsPanel(panelName) {
    var panels = document.getElementsByClassName('panel');
    var navbarButtons = document.getElementsByClassName('navButton');

    for (var i = 0; i < panels.length; ++i) {
        var nextPanel = panels[i];

        if (nextPanel.id === panelName + 'Panel') {
            nextPanel.style.display = 'inline';
        } else {
            nextPanel.style.display = 'none';
        }
    }

    for (var j = 0; j < navbarButtons.length; ++j) {
        var nextButton = navbarButtons[j];

        if (nextButton.id === panelName + 'NavButton') {
            nextButton.className = 'active navButton';
        } else {
            nextButton.className = 'navButton';
        }
    }
}

function setNavbarButtonEvents() {
    $('.navButton').click(function() {
        setOptionsPanel(this.id.replace('NavButton', ''));
    });
}

function setImportExportEvents() {
    var $importBrowser = $('#importBrowser');

    importExport.init();

    $importBrowser.on('change', function() {
        importExport.triggerImportBrowser(this);
    });

    $('#importButton').click(function() {
        $importBrowser.trigger('click');
    });

    $('#exportButton').click(function() {
        importExport.exportSettingsToFile();
    });
}

function setSaveButtonEvent() {
    saveButtons = $('input.saveSettingsButton[type="button"]');

    saveButtons.click(function() {
        saveButtons.attr('disabled', true);

        setTimeout(function() {
            settingsInterface.savePageSettingsToStorage().then(displaySaveSuccessful);
        }, SAVE_DELAY_TIMEOUT);
    });
}

function displaySaveSuccessful() {
    saveButtons.removeAttr('disabled');
}

module.exports = {
    init: init,
    setOptionsPanel: setOptionsPanel
};