"use strict";

var GTE_CHROME = (function(){

const URL_REGEX = /\b(http:\/\/|https:\/\/)/g;

//update notification
chrome.runtime.onInstalled.addListener(function(details){
    if (details.reason === 'install') {
        //open the options page on install
        chrome.runtime.openOptionsPage();
    }
});

function chromeFileInjection(tabID, fileArray, injectFunction, onComplete) {
    //final step (onComplete) added first; we are building our injectionQueue backwards
    var currCallback = typeof onComplete === 'function' ? onComplete : null;

    //queue member generator
    function generateNextCallback(tabID, currentFile, nextCallback) {
        return function() { injectFunction(tabID, currentFile, nextCallback); };
    }

    //build queue backwards
    for (var fileIndex = fileArray.length - 1; fileIndex > -1; --fileIndex) {
        if (chrome.runtime.lastError) {
            break;
        } else {
            // Tab exists
            currCallback = generateNextCallback(tabID, {
                file: './data/' + fileArray[fileIndex],
                runAt: 'document_end',
                allFrames: false
            }, currCallback);
        }

    }

    //if the fileArray wasn't empty, callback will not be undefined and queue will begin
    if (typeof currCallback === 'function') {
        currCallback();
    }
}
    
var manager,
    listenerCallback,
    adaptor = {

    scriptFile: 'js/chromeAdaptor.js',

    localDirectory: function (url) {
        return chrome.extension.getURL('./data/' + url);
    },

    //is this really necessary? both firefox and chrome use 'tab.url'...
    getTabURL: function(tab) {
        return tab.url;
    },

    initializeTab: function(tab, files, message) {
        //do not run on the chrome store (not allowed)
        if (!tab.url.match('https://chrome.google.com/webstore/')) {
            chromeFileInjection(tab.id, files.css, chrome.tabs.insertCSS);
            chromeFileInjection(tab.id, files.js, chrome.tabs.executeScript, function () {
                chrome.tabs.sendMessage(tab.id, message);
            });
        }
    },

    getLoadedTabs: function(callback) {
        chrome.tabs.query({url: ['http://*/*', 'https://*/*'], status: 'complete'}, callback);
    },

    initializeTabListener: function(callback) {
        chrome.tabs.onUpdated.addListener(function(tabID, changeInfo, tab) {
            if (changeInfo.status === 'complete') {
                if (tab.url.match(URL_REGEX)) {
                    callback(tab);
                }
            }
        });
    },
    
    storageLoad: function(onLoad){
        chrome.storage.local.get(null, function(data) {
            if (chrome.runtime.lastError) {
            	//something went wrong
                console.warn("Whoops... " + chrome.runtime.lastError.message);
            }
            onLoad(data);
        });
    },
        
    storageSave: function(data){
        chrome.storage.local.set(data);
    },

    sendMessage: function(tab, message, data) {
        chrome.runtime.sendMessage({message: message, data: data});
    },

    messageListener: function(messageHandler) {
        chrome.runtime.onMessage.removeListener(listenerCallback);

        listenerCallback = function(request, sender, sendResponse) {
            if (messageHandler && sender.tab) {
                messageHandler(sender, request.message, request.data, sendResponse);
            }
        };

        chrome.runtime.onMessage.addListener(listenerCallback);
    },
    
    XMLRequest: function(url, onLoad, onError) {
        var XML_REQUEST;

        XML_REQUEST = new XMLHttpRequest();
        XML_REQUEST.open('GET', url);

        XML_REQUEST.onreadystatechange = function() {
            //completed
            if (XML_REQUEST.readyState === 4) {
                if (XML_REQUEST.status === 200) {
                    //success
                    onLoad(XML_REQUEST.responseText);
                } else {
                    //failure
                    onError();
                }
            }
        };

        XML_REQUEST.send();
    }
};

function initialize() {
    manager = GTE_BACKGROUND.generateManager(Deferred, GTE_PARSER, adaptor);
    manager.initialize();
}

initialize();
//chrome namespace
}());