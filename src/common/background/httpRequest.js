var TIMEOUT = 10000;
var TOTAL_RETRIES = 2;


function sendXMLHttpRequest(url, successCallback, failureCallback) {
    var xmlRequest;

    xmlRequest = new XMLHttpRequest();
    xmlRequest.open('GET', url);
    xmlRequest.timeout = TIMEOUT;

    xmlRequest.onreadystatechange = function() {
        var code = xmlRequest.status;

        if (xmlRequest.readyState === 4) {
            if (code === 200) {
                if (!xmlRequest.responseText) {
                    xmlRequest.abort();

                    failureCallback(503);
                } else {
                    successCallback(xmlRequest.responseText);
                }
            } else if (code === 404) {
                xmlRequest.abort();

                failureCallback(code);
            }
        }
    };

    xmlRequest.ontimeout = function() {
        var code = xmlRequest.status;

        xmlRequest.abort();

        failureCallback(code);
    };

    xmlRequest.onerror = function() {
        var code = xmlRequest.status;

        xmlRequest.abort();

        failureCallback(code);
    };

    xmlRequest.send();
}


function attemptRequest(url, successCallback, failureCallback, retryCount, previousError) {
    retryCount = retryCount || 0;

    if (retryCount === TOTAL_RETRIES) {
        failureCallback(previousError);
    } else {
        sendXMLHttpRequest(url, function(responseText) {
            successCallback(responseText);
        }, function(error) {
            if (error === 404) {
                failureCallback(error);
            } else {
                setTimeout(function() {
                    attemptRequest(url, successCallback, failureCallback, retryCount + 1, error);
                }, TIMEOUT);
            }
        });
    }
}


module.exports = function(url, successCallback, failureCallback) {
    attemptRequest(url, successCallback, failureCallback);
};