'use strict';


function makeHTTPRequest(url) {
    return new Promise(function(resolve, reject) {
        var XML_REQUEST;

        XML_REQUEST = new XMLHttpRequest();
        XML_REQUEST.open('GET', url);

        XML_REQUEST.onreadystatechange = function() {
            //completed
            if (XML_REQUEST.readyState === 4) {
                if (XML_REQUEST.status === 200) {
                    resolve(XML_REQUEST.responseText);
                } else {
                    reject();
                }
            }
        };

        XML_REQUEST.send();
    });
}

module.exports = makeHTTPRequest;