'use strict';
var browserBackend = require('browserBackend');
var domainFilter = require('domainFilter');
var extensionSettings = require('extensionSettings');


var ILLEGAL_PAGE_ERROR = 'GTE cannot run on this page.';
var activeTab;
var contentDiv;
var activeDomain;
var filterControlsDiv;
var pageFilterStatus;
var userSettings;


function init() {
    contentDiv = document.getElementById('content');
    configureOpenSettingsButton();

    browserBackend.getActiveTab().then(function(tab) {
        activeTab = tab;
        activeDomain = domainFilter.extractDomainFromAddress(tab.url);

        if (domainFilter.isURLIllegal(tab.url) === true) {
            displayIllegalMessage();
        } else {
            extensionSettings.getSettings().then(function(settings) {
                userSettings = settings;

                updatePopup();
            });
        }
    });
}

function displayIllegalMessage() {
    var messageDiv = document.createElement('div');

    messageDiv.className = 'error';

    messageDiv.textContent = ILLEGAL_PAGE_ERROR;

    while (contentDiv.hasChildNodes()) {
        contentDiv.removeChild(contentDiv.lastChild);
    }

    contentDiv.appendChild(messageDiv);
}

function updatePopup() {
    var filteredRule = domainFilter.getFilteredRule(activeTab.url, userSettings.domainFilterList);

    pageFilterStatus = document.getElementById('pageFilterStatus');

    displayFilterMode();
    displayPageFilterStatus(filteredRule);

    configureFilterButtons(filteredRule);
}

function displayFilterMode() {
    var filterModeContainer = document.getElementById('filterMode');
    var filterModeDiv = document.createElement('b');

    filterModeDiv.textContent = userSettings.domainFilterMode;

    filterModeContainer.appendChild(filterModeDiv);
}

function displayPageFilterStatus(filteredRule) {
    var filterInfoDiv = document.createElement('b');

    if (userSettings.domainFilterList.length === 0 || filteredRule === null) {
        filterInfoDiv.textContent = 'Unfiltered';
    } else {
        filterInfoDiv.textContent = 'Filtered';
    }

    pageFilterStatus.appendChild(filterInfoDiv);
}

function displayFilteredRule(filteredRule) {
    var filterRuleContainer = document.createElement('div');

    filterRuleContainer.id = 'filterRule';
    filterRuleContainer.textContent = filteredRule;

    pageFilterStatus.appendChild(filterRuleContainer);
}

function configureFilterButtons(filteredRule) {
    filterControlsDiv = document.getElementById('filterControls');

    if (filteredRule !== null) {
        var removeRuleButton = createInputButton('Remove Associated Rule');

        removeRuleButton.addEventListener('click', function() {
            userSettings.domainFilterList.splice(userSettings.domainFilterList.indexOf(filteredRule), 1);
            extensionSettings.setSettings(userSettings);

            disableButtons();
            transformRefreshButton(this);
        });

        filterControlsDiv.appendChild(removeRuleButton);
    } else {
        var filterEntireDomainButton = createInputButton(userSettings.domainFilterMode + ' ' + activeDomain + '/*');
        var filterSpecificPageButton = createInputButton(userSettings.domainFilterMode + ' This Exact Page');

        filterEntireDomainButton.addEventListener('click', function() {
            userSettings.domainFilterList.push(activeDomain + '/*');
            extensionSettings.setSettings(userSettings);

            disableButtons();
            transformRefreshButton(this);
        });

        filterSpecificPageButton.addEventListener('click', function() {
            userSettings.domainFilterList.push(domainFilter.removeProtocolFromAddress(activeTab.url));
            extensionSettings.setSettings(userSettings);

            disableButtons();
            transformRefreshButton(this);
        });

        filterControlsDiv.appendChild(filterEntireDomainButton);
        filterControlsDiv.appendChild(filterSpecificPageButton);
    }
}

function configureOpenSettingsButton() {
    document.getElementById('openSettingsButton').addEventListener('click', function() {
        browserBackend.openOptionsPage();
    });
}

function createInputButton(value) {
    var result = document.createElement('input');

    result.type = 'button';
    result.value = value;

    return result;
}

function transformRefreshButton(button) {
    button.value = '';
    button.className = 'refreshButton';
}

function disableButtons() {
    var buttons = document.querySelectorAll('input[type=button]');

    for (var i = 0; i < buttons.length; ++i) {
        buttons[i].disabled = true;
    }
}

document.addEventListener('DOMContentLoaded', init, false);