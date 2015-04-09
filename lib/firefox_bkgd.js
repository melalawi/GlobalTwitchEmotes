var bkgd = require("./bkgd.js");

var background;// = new Background('firefox');

exports.initialize = function() {
    background = bkgd.initialize();
    background.initialize();
};


/*
chrome.storage.onChanged.addListener(function(changes, namespace) {
    background = new Background('chrome');
    background.initialize();
});*/