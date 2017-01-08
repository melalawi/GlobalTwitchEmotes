var $ = require('jquery');
var extensionSettings = require('extensionSettings');
var browserBackend = require('browserBackend');


var $hostStatusTable;
var HOSTS = [
    {
        name: 'twitch',
        displayName: 'Twitchemotes.com'
    },
    {
        name: 'bttv',
        displayName: 'BetterTTV'
    },
    {
        name: 'ffz',
        displayName: 'FrankerFaceZ'
    }
];
var hostStatusesEntries = {};


function init() {
    $hostStatusTable = $('#hostStatusTable');

    buildTable();
}

function buildTable() {
    var $nameColumn = $hostStatusTable.find('#hostNameColumn');
    var $statusColumn = $hostStatusTable.find('#hostStatusColumn');

    $nameColumn.append($('<div>', {
        class: 'header'
    }).text('Endpoint'));

    $statusColumn.append($('<div>', {
        class: 'header'
    }).text('Status'));

    for (var i = 0; i < HOSTS.length; ++i) {
        var $statusEntry = $('<div>', {
            class: HOSTS[i].name + 'Status'
        });

        hostStatusesEntries[HOSTS[i].name] = $statusEntry;

        $nameColumn.append($('<div>').text(HOSTS[i].displayName));
        $statusColumn.append($statusEntry);
    }
}

function updateStatuses() {
    var promises = [];

    promises.push(extensionSettings.getSettings());
    promises.push(browserBackend.sendMessageToBackground({
        message: 'emotes'
    }));

    Promise.all(promises).then(function(results) {
        console.log(results);

        updateTableStatuses(results[0], results[1]);
    });
}

function updateTableStatuses(settings, emotes) {
    updateTwitchEmotesStatus(emotes, settings);
    updateStatusRow(emotes, settings, 'bttv');
    updateStatusRow(emotes, settings, 'ffz');
}

function updateStatusRow(emotes, settings, entryName) {
    var global = entryName + 'Global';
    var channel = entryName + 'Channels';
    var row = hostStatusesEntries[entryName];
    var hostHealth;

    if (settings[global] === false && settings[channel] === false) {
        hostHealth = 0;
    } else if (settings[global] === true) {
        hostHealth = emotes.hasOwnProperty(global) ? 1 : -1;
    } else if (settings[channel] === true && settings[channel + 'List'].length > 0) {
        var aChannelName = settings[channel + 'List'][0].toLowerCase();

        hostHealth = emotes.hasOwnProperty(channel + '_' + aChannelName) ? 1 : -1;
    }

    setEndpointStatus(row, hostHealth);
}

function updateTwitchEmotesStatus(emotes, settings) {
    var hostHealth;

    if ((settings.twitchGlobal || settings.twitchChannels) === false) {
        hostHealth = 0;
    } else {
        var hostInGoodHealth = (settings.twitchGlobal === emotes.hasOwnProperty('twitchGlobal')) && (settings.twitchChannels === emotes.hasOwnProperty('twitchChannels'));

        if (hostInGoodHealth) {
            hostHealth = 1;
        } else {
            hostHealth = -1;
        }
    }

    setEndpointStatus(hostStatusesEntries.twitch, hostHealth);
}

function setEndpointStatus(endpoint, status) {
    if (status === -1) {
        endpoint.addClass('error').text('Could not reach endpoint.');
    } else if (status === 0) {
        endpoint.addClass('inactive').text('Endpoint currently not in use.');
    } else {
        endpoint.addClass('success').text('Endpoint successfully reached.');
    }
}

module.exports = {
    init: init,
    updateStatuses: updateStatuses
};