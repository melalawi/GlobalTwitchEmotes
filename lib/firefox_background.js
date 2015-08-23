//need to rework callback script
var UUGE_FIREFOX = (function(){

"use strict";

exports.initialize = function() {
    manager = bkgd.newBackground(adaptor);
    manager.initialize();
};

exports.manageMessage = function(data, worker) {
    if (callbackListener) {
        callbackListener(data, worker);
    }
};

var bkgd = require("background"),
    tabs = require("sdk/tabs"),
    self = require("sdk/self"),
    manager,
    callbackListener,
    adaptor;

var { attach, detach } = require('sdk/content/mod');
var { Style } = require('sdk/stylesheet/style');

function urlMatch(tab, urlObject) {
    var result = false;

    if (Array.isArray(urlObject)) {
        for (var index = 0; index < urlObject.length; ++index) {
            //normally chrome matches urls using asterisks but in this case we don't need them
            var currentURL = urlObject[index].replace(/\*/g, '');

            if (tab.url.indexOf(currentURL) !== -1) {
                result = true;
                break;
            }
        }
    } else {
        var validURL = urlObject.replace(/\*/g, '');

        if (tab.url.indexOf(validURL) !== -1) {
            result = true;
        }
    }

    return result;
}

adaptor = {

    Deferred: require("deferred").Deferred,

    localDirectory: function (url) {
        return self.data.url(url);
    },

    injectCSS: function(tab, css) {
        if (css.file) {
            attach(Style({uri: css.file}), tab.tab);
        } else if (css.code) {
            attach(Style({source: css.code}), tab.tab);
        }
    },

    getTabs: function(url, callback) {
        var tabQueue = [];

        for (let tab of tabs) {
            if (urlMatch(tab, url)) {

                tabQueue.push(tab.attach({}));
            }
        }

        return tabQueue;
    },

    initializeTabListener: function(url, callback) {
        tabs.on('ready', function(tab){
            if (urlMatch(tab, url)) {
                callback(tab.attach({}));
            }
        });
    },

    storageLoad: function(onLoad){
        onLoad(require("sdk/simple-storage").storage);
    },
        
    storageSave: function(data){
        require("sdk/simple-storage").storage = data;
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
    },

    sendMessage: function(worker, data) {
        worker.port.emit("message", data);
    },

    messageListener: function(backgroundCallback) {
        callbackListener = function(data, worker) {
            if (callbackListener.callback) {
                callbackListener.callback(worker, data.message, data.data);
            }
        };

        callbackListener.callback = backgroundCallback;
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