//need to rework callback script
var UUGE_FIREFOX = (function(){

"use strict";

const URL_REGEX = /\b(http:\/\/|https:\/\/)/g;

exports.initialize = function() {
    manager = background.generateManager(adaptor);
    manager.initialize();
};

exports.manageMessage = function(data, worker) {
    if (callbackListener) {
        callbackListener(data, worker);
    }
};

var background = require("background"),
    tabs = require("sdk/tabs"),
    self = require("sdk/self"),
    pagemod = require("sdk/page-mod"),
    manager,
    callbackListener,
    adaptor,
    {attach, detach} = require('sdk/content/mod'),
    {Style} = require('sdk/stylesheet/style');

adaptor = {
    scriptFile: 'js/firefoxAdaptor.js',

    localDirectory: function (url) {
        return self.data.url(url);
    },

    getTabURL: function(tab) {
        return tab.url;
    },

    initializeTab: function(tab, files, message) {
        for (var jsIndex = 0; jsIndex < files.js.length; ++jsIndex) {
            files.js[jsIndex] = self.data.url(files.js[jsIndex]);
        }

        for (var cssIndex = 0; cssIndex < files.css.length; ++cssIndex) {
            files.css[cssIndex] = './' + files.css[cssIndex];
        }

        var worker = tab.attach({
            contentScriptFile: files.js,
            contentScriptWhen: 'ready',
            onAttach: function() {
                attach(Style({ uri: files.css }), tab);

                this.port.emit('data', message);
            }
        });
    },

    getLoadedTabs: function(callback) {
        var tabQueue = [];

        for (let tab of tabs) {
            if (tab.url.match(URL_REGEX)) {
                tabQueue.push(tab);
            }
        }

        callback(tabQueue);
    },

    initializeTabListener: function(callback) {
        tabs.on('ready', function(tab){
            if (tab.url.match(URL_REGEX)) {
                callback(tab);
            }
        });
    },

    storageLoad: function(onLoad){
        onLoad(require("sdk/simple-storage").storage);
    },
        
    storageSave: function(data){
        require("sdk/simple-storage").storage = data;
    },

    sendMessage: function(worker, message, data) {
        worker.port.emit(message, data);
    },

    messageListener: function(backgroundCallback) {
        callbackListener = function(data, worker) {
            if (callbackListener.callback) {
                callbackListener.callback(worker, data.message, data.data, function(returnMessage){
                    worker.port.emit("message", returnMessage);
                });
            }
        };

        callbackListener.callback = backgroundCallback;
    },

    XMLRequest: function(url, onLoad, onError) {
        var REQUEST = require("sdk/request").Request({
            url: url,
            overrideMimeType: "text/plain; charset=latin1",
            onComplete: function (response) {
                if (response.status === 200) {
                    onLoad(response.text);
                } else {
                    onError();
                }

            }
        });

        REQUEST.get();
    }
};

//if settings changes, reinitialize
//no inherent storage change listener in firefox addon-sdk that i'm aware of
//will just use a function that is called when settings are saved (main.js)
    /*
exports.onStorageChange = function() {
    manager = bkgd.newBackground(adaptor);
    manager.initialize();
};*/

//firefox namespace
}());