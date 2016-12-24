'use strict';
var $ = require('jquery');
var FileSaver = require('file-saver');
var settingsInterface = require('./settingsInterface');
var extensionSettings = require('extensionSettings');


var IMPORT_SUCCESS_DURATION = 3000;
var $importStatus;
var $importStatusIcon;
var $importStatusText;
var $saveButtons;

function init() {
    $importStatus = $('#importStatus');
    $importStatusIcon = $importStatus.find('.statusIcon').eq(0);
    $importStatusText = $importStatus.find('.statusText').eq(0);
    $saveButtons = $('input.saveSettingsButton[type="button"]');
}

function triggerImportBrowser(browser) {
    var textFile = browser.files[0];
    var fileReader = new FileReader();

    fileReader.addEventListener('loadend', function() {
        applyJSONToPage(fileReader.result);

        this.value = '';
    }.bind(browser), false);

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
            $saveButtons.eq(0).trigger('click');
            triggerValidImportNotification();

        }
    } catch(e) {
        triggerInvalidImportNotification();
    }
}

function triggerInvalidImportNotification() {
    $importStatus.css('display', 'flex');
    $importStatusText.text('Invalid or corrupt file.').removeClass('success').addClass('error');
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
}

function exportSettingsToFile() {
    var pageSettings = JSON.stringify(settingsInterface.getPageSettings(), null, 4);
    var fileBlob = new Blob([pageSettings], {
        type: 'text/plain; charset=utf-8'
    });

    FileSaver.saveAs(fileBlob, 'GTESettings.txt');
}

module.exports = {
    init: init,
    triggerImportBrowser: triggerImportBrowser,
    exportSettingsToFile: exportSettingsToFile
};