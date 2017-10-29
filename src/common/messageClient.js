var browser = require('browser');


function MessageClient() {
    var messageReceivedCallback = null;

    // Set callbacks before listening
    this.listen = function(callback) {
        messageReceivedCallback = callback;

        browser.addOnMessageCallback(onMessage);
    };

    this.stopListening = function() {
        messageReceivedCallback = null;

        browser.removeOnMessageCallback(onMessage);
    };

    this.messageTab = function(tab, message) {
        browser.sendMessageToTab(tab, message, onResponse);
    };

    this.messageBackground = function(message) {
        browser.sendMessageToBackground(message, onResponse);
    };

    function onResponse(response) {
        if (messageReceivedCallback) {
            messageReceivedCallback(response);
        }
    }

    function onMessage(message, sender, responseCallback) {
        if (messageReceivedCallback) {
            messageReceivedCallback(message, responseCallback, sender.tab);
        }

        return true;
    }
}

module.exports = MessageClient;