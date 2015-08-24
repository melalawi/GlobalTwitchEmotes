"use strict";

var listenerCallback;

function getVersionNumber() {
	return chrome.runtime.getManifest().version;
}

function getData(onLoad) {
    chrome.runtime.sendMessage(null, {message: 'load'}, null, function (response){
        if (onLoad) {
            onLoad(response);
        }
    });
}

function setData(data, callback) {
    listenerCallback = function(request, sender, sendResponse) {
        if (request.message === 'settingsSaved') {
            chrome.runtime.onMessage.removeListener(listenerCallback);

            callback();
        }
    };
    chrome.runtime.onMessage.addListener(listenerCallback);

	chrome.runtime.sendMessage(null, {message: 'saveAll', data: data});
}
