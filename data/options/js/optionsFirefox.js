"use strict";

var listenerCallback;

function getVersionNumber() {
    return self.options.versionNumber;
}

function getData(onLoad) {
    self.port.emit("message", {message: "load"});

    self.port.once("message", function(data) {
        if (onLoad) {
            onLoad(data);
        }
    });
}

function setData(data, callback) {
    self.port.once("settingsSaved", function(message) {
        callback();
    });

    self.port.emit("message", {message: "saveAll", data: data});
}

(function(){
	if (document.readyState === 'complete') {
		initialize();
	} else {
		$(document).ready(initialize);
	}
}());