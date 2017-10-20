var workers = [];
var workerRoundRobinCounter = 0;
var pendingSearches = {};
var currentID = 0;


function initialize(workerCount) {
    for (var i = 0; i < workerCount; ++i) {
        var worker = new Worker('searchWorker.js');

        worker.onmessage = onMessage;

        workers.push(worker);
    }
}

function onMessage(event) {
    var message = event.data;
    var searchEntry = pendingSearches[message.payload.searchID];

    delete pendingSearches[message.payload.searchID];

    searchEntry.callback({
        header: 'emoteSearchResults',
        payload: {
            id: searchEntry.requestID,
            foundEmotes: message.payload.results
        }
    });
}

function setEmotes(emotes) {
    for (var i = 0; i < workers.length; ++i) {
        workers[i].postMessage({
            header: 'emotes',
            payload: emotes
        });
    }
}

function setSettings(settings) {
    for (var i = 0; i < workers.length; ++i) {
        workers[i].postMessage({
            header: 'settings',
            payload: settings
        });
    }
}

function search(requestID, text, callback) {
    var searchID = currentID++;

    console.log(text);

    pendingSearches[searchID] = {
        requestID: requestID,
        callback: callback
    };

    workers[workerRoundRobinCounter].postMessage({
        header: 'search',
        payload: {
            searchID: searchID,
            text: text
        }
    });

    workerRoundRobinCounter = (workerRoundRobinCounter + 1) % workers.length;
}

module.exports = {
    initialize: initialize,
    setEmotes: setEmotes,
    setSettings: setSettings,
    search: search
};