var browser = require('browser');
var emoteParser = require('./emoteParser');
var tipsy = require('./tipsy');


var client;


function initialize() {
    if (!window.contentScriptInjected) {
        window.contentScriptInjected = true;

        client = new browser.MessageClient(false);

        client.listen(onMessageFromBackground);

        emoteParser.run(client);
    } else {
        console.log('Reinjection detected and averted');
    }
}

function onMessageFromBackground(message, responseCallback) {
    if (!message) {
        return;
    }

    console.log('Received message with header "' + message.header + '"');

    if (message.header === 'settings') {
        if (message.payload.twitchStyleTooltips === true) {
            tipsy.init();
        }

        if (message.payload.replaceYouTubeKappa === true) {
            emoteParser.replaceKappers();
        }
    } else {
        emoteParser.onBackgroundMessage(message);
    }

    if (responseCallback) {
        responseCallback();
    }
}


initialize();