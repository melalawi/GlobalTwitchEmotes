const RETRY_DELAY = 1000;
const MAX_RETRY_COUNT = 3;
const GET_REQUEST_OPTIONS = {
    method: 'get'
};


function sendGetRequest(url) {
    return new Promise(function(resolve, reject) {
        var fetchCall = function(currentRetryCount) {
            fetch(url, GET_REQUEST_OPTIONS).then(function(response) {
                resolve(response.json());
            }).catch(function(error) {
                if (currentRetryCount === MAX_RETRY_COUNT) {
                    reject(error);
                } else {
                    setTimeout(function() {
                        fetchCall(++currentRetryCount);
                    }, RETRY_DELAY);
                }
            });
        };

        fetchCall(0);
    });
}

module.exports = {
    get: sendGetRequest
};