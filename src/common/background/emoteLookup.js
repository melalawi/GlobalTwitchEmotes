var httpRequest = require('./httpRequest');


// Five minute periodic retrying
var PERIODIC_LOOKUP_COOLDOWN = 5 * 60 * 1000;


function EmoteLookup(host, channelName, callback) {
    var self = this;
    var periodicLookupID;

    this.host = host;
    this.channelName = channelName;
    this.callback = callback;

    this.retrieveEmotes = function() {
        return new Promise(function(resolve) {
            requestEmotes(
                function(responseJSON) {
                    onSuccess(responseJSON, resolve);
                },
                function(errorCode) {
                    console.log('Could not reach "' + self.host.getURL(self.channelName) + '" - Error: ' + errorCode);

                    if (errorCode !== 404) {
                        startPeriodicLookup();
                    }

                    resolve();
                }
            );
        });
    };

    function startPeriodicLookup() {
        periodicLookupID = setInterval(function() {
            requestEmotes(function(responseJSON) {
                console.log(self.host.getURL(self.channelName) + ' 200');

                clearInterval(periodicLookupID);

                onSuccess(responseJSON, self.callback);
            }, function(errorCode) {
                console.log(self.host.getURL(self.channelName) + ' ' + errorCode);

                if (errorCode === 404) {
                    clearInterval(periodicLookupID);
                }
            });
        }, PERIODIC_LOOKUP_COOLDOWN);
    }

    function onSuccess(responseJSON, callback) {
        var setName = self.host.name;
        var emoteSet = self.host.parseEmotes(responseJSON);

        if (self.host.requiresChannel === true) {
            setName += '_' + self.channelName;
        }

        callback({
            setName: setName,
            emoteSet: emoteSet
        });
    }

    function requestEmotes(success, failure) {
        var url = self.host.getURL(self.channelName);

        httpRequest(url,
            function(responseText) {
                success(JSON.parse(responseText));
            }, function(errorCode) {
                failure(errorCode);
            }
        );
    }
}


module.exports = EmoteLookup;