'use strict';
var $ = require('jquery');
var settingsInterface = require('./settingsInterface');
var extensionSettings = require('extensionSettings');


var IMPORT_SUCCESS_DURATION = 3000;
var $importStatus;
var $importStatusIcon;
var $importStatusText;

function init() {
    $importStatus = $('#importStatus');
    $importStatusIcon = $importStatus.find('.statusIcon').eq(0);
    $importStatusText = $importStatus.find('.statusText').eq(0);
}

function triggerImportBrowser(browser) {
    var textFile = browser.files[0];
    var fileReader = new FileReader();

    fileReader.addEventListener('load', function() {
        applyJSONToPage(fileReader.result);
    }, false);

    fileReader.readAsText(textFile);
}

function applyJSONToPage(text) {
    try {
        var jsonifiedSettings = JSON.parse(text);
        var valid = true;

        for (var key in jsonifiedSettings) {
            if (jsonifiedSettings.hasOwnProperty(key)) {
                if (extensionSettings.doesSettingExist(key) === false) {
                    triggerInvalidImportNotification();
                    valid = false;
                    break;
                }
            }
        }

        if (valid === true) {
            settingsInterface.setPageSettings(jsonifiedSettings);
            triggerValidImportNotification();
        }
    } catch(e) {
        triggerInvalidImportNotification();
    }
}

function triggerInvalidImportNotification() {
    $importStatus.css('display', 'flex');
    $importStatusText.text('Invalid import file.').removeClass('success').addClass('error');
    $importStatusIcon.show().removeClass('success').addClass('error');
}

function triggerValidImportNotification() {
    $importStatus.css('display', 'flex');
    $importStatusText.text('Import successful.').removeClass('error').addClass('success');
    $importStatusIcon.hide().removeClass('error').addClass('success');

    setTimeout(hideImportNotification, IMPORT_SUCCESS_DURATION);
}

function hideImportNotification() {
    $importStatus.css('display', 'none');
    $importStatusText.removeClass();
    $importStatusIcon.removeClass();
}

function generateSettingsJSON() {
    var pageSettings = settingsInterface.getPageSettings();

    return JSON.stringify(pageSettings);
}

module.exports = {
    init: init,
    triggerImportBrowser: triggerImportBrowser
};