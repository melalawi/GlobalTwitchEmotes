var $ = require('jquery');
var storageHelper = require('storageHelper');
var browser = require('browser');


const INTERNAL_TO_READABLE_SET_NAMES = {
    twitchGlobal: 'Twitchemotes.com - Global Emotes',
    bttvGlobal: 'BetterTTV - Global Emotes',
    ffzGlobal: 'FrankerFaceZ - Global Emotes',
    twitchChannels: 'Twitchemotes.com',
    bttvChannels: 'BetterTTV',
    ffzChannels: 'FrankerFaceZ'
};

const INTERNAL_SET_TO_SET_URL = {
    twitchGlobal: 'https://twitchemotes.com/',
    bttvGlobal: 'https://api.betterttv.net/2/emotes',
    ffzGlobal: 'https://www.frankerfacez.com/channel/__ffz_global',
    twitchChannels: 'https://twitchemotes.com/channel/%s',
    bttvChannels: 'https://api.betterttv.net/2/channels/%s',
    ffzChannels: 'https://www.frankerfacez.com/channel/%s'
};


var client = new browser.MessageClient(false);
var $loadedEmotesTable;
var $nameColumn;
var $ageColumn;


function init() {
    $loadedEmotesTable = $('#loadedEmotesTable');

    buildTable();
}

function buildTable() {
    $nameColumn = $loadedEmotesTable.find('#setNameColumn');
    $ageColumn = $loadedEmotesTable.find('#setAgeColumn');

    $nameColumn.append($('<div>', {
        class: 'header'
    }).text('Name'));

    $ageColumn.append($('<div>', {
        class: 'header'
    }).text('Cache Age'));
}

function updateStatuses() {
    client.listen(function(message) {
        loadEmoteSetsIntoTable(message.payload);
    });

    client.messageBackground({
        header: 'getAllEmotes'
    });
}

function loadEmoteSetsIntoTable(emotes) {
    for (var key in emotes) {
        if (emotes.hasOwnProperty(key)) {
            var set = emotes[key];

            if (set.hasOwnProperty('date') === false) {
                continue;
            }

            var readableSetName = generateReadableSetName(key);
            var ageInfo = getSetAge(set.date);

            var $entryName = $('<div>').append($('<a>', {target: '_blank', href: generateSetURL(key), title: readableSetName, alt: readableSetName}).text(readableSetName));
            var $entryAge = $('<div>', {title: ageInfo.altTextValue, alt: ageInfo.altTextValue}).text(ageInfo.displayValue);

            $nameColumn.append($entryName);
            $ageColumn.append($entryAge);
        }
    }
}

function generateReadableSetName(set) {
    if (INTERNAL_TO_READABLE_SET_NAMES.hasOwnProperty(set)) {
        return INTERNAL_TO_READABLE_SET_NAMES[set];
    } else {
        set = set.split(':');

        return INTERNAL_TO_READABLE_SET_NAMES[set[0]] + ' - ' + set[1] + ' Channel Emotes';
    }
}

function generateSetURL(set) {
    if (INTERNAL_SET_TO_SET_URL.hasOwnProperty(set)) {
        return INTERNAL_SET_TO_SET_URL[set];
    } else {
        set = set.split(':');

        return INTERNAL_SET_TO_SET_URL[set[0]].replace('%s', set[1]);
    }
}

function getSetAge(date) {
    var delta = Math.abs(Date.now() - date) / 1000;

    var minutes = Math.floor(delta / 60);
    var hours = Math.floor(minutes / 60);

    minutes -= hours * 60;

    var hoursString = hours < 10 ? '0' + hours : '' + hours;
    var minutesString = minutes < 10 ? '0' + minutes : '' + minutes;

    return {
        displayValue: hoursString + ':' + minutesString,
        altTextValue: 'Cached ' + hours + ' hours, ' + minutes + (minutes === 1 ? ' minute ago' : ' minutes ago')
    };
}

module.exports = {
    init: init,
    updateStatuses: updateStatuses
};