(function() {

"use strict";

var contentScript = new GTE_SCRIPT.ContentScript();

function initialize(settings) {
    contentScript.initialize(settings);
}

self.port.once("data", function(data){
    initialize(data);
});

})();
