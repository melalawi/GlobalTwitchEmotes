var browser = require('browser');
var domainFilter = require('domainFilter');
var MessageClient = require('messageClient');


const ILLEGAL_PAGE_ERROR = 'GTE cannot run on this page.';

var activeTab;
var client = new MessageClient();
var contentDiv;
var activeDomain;
var filterControlsDiv;
var pageFilterStatus;
var userSettings;


function initialize() {
    contentDiv = document.getElementById('content');
    configureOpenSettingsButton();

    browser.getActiveTab().then(function(tab) {
        activeTab = tab;
        activeDomain = domainFilter.extractDomainFromAddress(tab.url);

        if (domainFilter.isURLLegal(tab.url) === false) {
            displayIllegalMessage();
        } else {
            client.listen(onMessage);

            client.messageBackground({
                header: 'getAllSettings'
            });
        }
    });
}

function onMessage(message) {
    console.log('Message received with header "' + message.header + '"');

    if (message.header === 'settings') {
        client.stopListening();

        userSettings = message.payload;

        domainFilter.initialize(userSettings.domainFilterMode, userSettings.domainFilterList);

        updatePopup();
    }
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
    var filteredRule = domainFilter.getMatchingFilterRule(activeTab.url);

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

function configureFilterButtons(filteredRule) {
    filterControlsDiv = document.getElementById('filterControls');

    if (filteredRule !== null) {
        var removeRuleButton = createInputButton('Remove Associated Rule');

        removeRuleButton.filteredRule = filteredRule;

        removeRuleButton.addEventListener('click', removeAssociatedRule);

        filterControlsDiv.appendChild(removeRuleButton);
    } else {
        var filterEntireDomainButton = createInputButton(userSettings.domainFilterMode + ' ' + activeDomain + '/*');
        var filterSpecificPageButton = createInputButton(userSettings.domainFilterMode + ' This Exact Page');

        filterEntireDomainButton.addEventListener('click', addDomainToList);
        filterSpecificPageButton.addEventListener('click', addURLToList);

        filterControlsDiv.appendChild(filterEntireDomainButton);
        filterControlsDiv.appendChild(filterSpecificPageButton);
    }
}

function removeAssociatedRule() {
    userSettings.domainFilterList.splice(userSettings.domainFilterList.indexOf(this.filteredRule), 1);

    client.messageBackground({
        header: 'setSettingsEntry',
        payload: {
            key: 'domainFilterList',
            value: userSettings.domainFilterList
        }
    });

    disableButtons();
    transformRefreshButton(this);
}

function addDomainToList() {
    userSettings.domainFilterList.push(activeDomain + '/*');

    client.messageBackground({
        header: 'setSettingsEntry',
        payload: {
            key: 'domainFilterList',
            value: userSettings.domainFilterList
        }
    });

    disableButtons();
    transformRefreshButton(this);
}

function addURLToList() {
    userSettings.domainFilterList.push(domainFilter.removeProtocolFromAddress(activeTab.url));

    client.messageBackground({
        header: 'setSettingsEntry',
        payload: {
            key: 'domainFilterList',
            value: userSettings.domainFilterList
        }
    });

    disableButtons();
    transformRefreshButton(this);
}

function configureOpenSettingsButton() {
    document.getElementById('openSettingsButton').addEventListener('click', function() {
        console.log('Opening Options Page...');

        browser.openOptionsPage();
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
    button.disabled = false;

    button.removeEventListener('click', removeAssociatedRule);
    button.removeEventListener('click', addDomainToList);
    button.removeEventListener('click', addURLToList);

    button.addEventListener('click', function() {
        console.log('Reloading tab...');

        browser.reloadTab(activeTab);

        this.disabled = true;

        window.close();
    });
}

function disableButtons() {
    var buttons = document.querySelectorAll('input[type=button]');

    for (var i = 0; i < buttons.length; ++i) {
        buttons[i].disabled = true;
    }
}

document.addEventListener('DOMContentLoaded', function() {
    browser.isBackgroundScript().catch(initialize);
}, false);