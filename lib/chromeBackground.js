"use strict";

var GTE_CHROME = (function(){

const URL_REGEX = /\b(http:\/\/|https:\/\/)/g;

//update notification
chrome.runtime.onInstalled.addListener(function(details){
    if (details.reason === 'update') {
        var currentVersion = chrome.runtime.getManifest().version,
            previousVersion = details.previousVersion;

        if (currentVersion !== previousVersion) {
            chrome.notifications.create(null, {
                type: 'basic',
                title: 'Global Twitch Emotes Has Been Updated!',
                iconUrl: 'logo/128.png',
                message: 'GTE v' + currentVersion + ' now comes with FrankerFaceZ Channel support and enhanced filtering!'
            });
        }
    } else {
        //install
        
    }
});
    
var manager,
    listenerCallback,
    adaptor = {

    scriptFile: './data/js/chromeAdaptor.js',

    Deferred: Deferred,

    localDirectory: function (url) {
        return chrome.extension.getURL('./data/' + url);
    },

    //is this really necessary? both firefox and chrome use 'tab.url'...
    getTabURL: function(tab) {
        return tab.url;
    },

    initializeTab: function(tab, files, message) {
        chromeFileInjection(tab.id, files.css, chrome.tabs.insertCSS);
        chromeFileInjection(tab.id, files.js, chrome.tabs.executeScript, function(){
            chrome.tabs.sendMessage(tab.id, message);
        });
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

    sendMessage: function(tab, data) {
        chrome.runtime.sendMessage(data);
    },

    messageListener: function(messageHandler) {
        chrome.runtime.onMessage.removeListener(listenerCallback);

        listenerCallback = function(request, sender, sendResponse) {
            if (messageHandler) {
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
    manager = new GTE_BACKGROUND.Manager(adaptor);
    manager.initialize();
}

initialize();

/*
 chromeDynamicInjection(tabID, [
 { type: chrome.tabs.insertCSS, details: {file: './data/css/style.css', runAt: 'document_start' }},
 { type: chrome.tabs.insertCSS, details: {file: './data/css/spectrum.css', runAt: 'document_start' }},
 { type: chrome.tabs.executeScript, details: {file: './data/jquery-2.1.4.min.js', runAt: 'document_start' }},
 { type: chrome.tabs.executeScript, details: {file: './data/spectrum.js', runAt: 'document_start' }},
 { type: chrome.tabs.executeScript, details: {file: './data/options_chrome.js', runAt: 'document_start' }},
 { type: chrome.tabs.executeScript, details: {file: './data/options.js', runAt: 'document_start' }}
 ]);
 */
function chromeFileInjection(tabID, fileArray, injectFunction, onComplete) {
    //final step (onComplete) added first; we are building our injectionQueue backwards
    var currCallback = typeof onComplete === 'function' ? onComplete : null;

    //queue member generator
    function generateNextCallback(tabID, currentFile, nextCallback) {
        return function() { injectFunction(tabID, currentFile, nextCallback); };
    }

    //build queue backwards
    for (var fileIndex = fileArray.length - 1; fileIndex > -1; --fileIndex) {
        currCallback = generateNextCallback(tabID, {file: fileArray[fileIndex], runAt: 'document_end'}, currCallback);
    }

    //if the fileArray wasn't empty, callback will not be undefined and queue will begin
    if (typeof currCallback === 'function') {
        currCallback();
    }
}
//chrome namespace
}());