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

function setData(data) {
    listenerCallback = function(request, sender, sendResponse) {
        if (request === 'settingsSaved') {
            chrome.runtime.onMessage.removeListener(listenerCallback);

            alert('Settings Saved!');
        }
    };
    chrome.runtime.onMessage.addListener(listenerCallback);

	chrome.runtime.sendMessage(null, {message: 'saveAll', data: data});
}

function sendMessage(text) {
	chrome.runtime.sendMessage({message: text});
}

(function(){
	if (document.readyState === 'complete') {
		initialize();
	} else {
		$(document).ready(initialize);
	}
}());