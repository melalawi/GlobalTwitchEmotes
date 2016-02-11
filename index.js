"use strict";

var background = require("lib/firefoxBackground"),
    simplePrefs = require("sdk/simple-prefs"),
    tabs = require("sdk/tabs"),
    self = require("sdk/self");

//on extension install, open the options page
exports.main = function (options, callbacks) {
    if (options.loadReason === 'install') {
        openOptionsPage();
    }
};

background.initialize();

var contentScriptOptions = {"parentDirectory" : self.data.url(''), versionNumber: self.version};

//options
simplePrefs.on("accessSettings", openOptionsPage);

function openOptionsPage() {
    tabs.open({
        url: self.data.url("./options/options.html"),
        onReady: function(worker) {
            var dataTransfer = worker.attach({
                contentScriptFile: [
                    "./js/jquery-2.1.4.min.js",
                    "./options/js/jquery-ui.min.js",
                    "./options/js/jquery.appendGrid-1.6.0.js",
                    "./options/js/options.js",
                    "./options/js/optionsFirefox.js"],
                contentScriptOptions: contentScriptOptions
            });

            dataTransfer.port.on("message", function(data){
                background.manageMessage(data, dataTransfer);
            });
        }
    });
}