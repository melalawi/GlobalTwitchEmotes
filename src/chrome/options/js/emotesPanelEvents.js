'use strict';
var bttv = require('./bttv');
var listJS = require('list.js');


function setHostPanel(panelName) {
    var panels = document.getElementsByClassName('hostSettings');
    var hostButtons = document.getElementsByClassName('hostButton');

    for (var i = 0; i < panels.length; ++i) {
        var nextPanel = panels[i];

        if (nextPanel.id === panelName + 'Settings') {
            nextPanel.style.display = 'inline';
        } else {
            nextPanel.style.display = 'none';
        }
    }

    for (var j = 0; j < hostButtons.length; ++j) {
        var nextButton = hostButtons[j];

        if (nextButton.id === panelName + 'HostButton') {
            nextButton.className = 'active hostButton';
        } else {
            nextButton.className = 'hostButton';
        }
    }
}

function setHostbarButtonEvents() {
    var hostButtons = document.getElementsByClassName('hostButton');

    for (var i = 0; i < hostButtons.length; ++i) {
        hostButtons[i].onclick = function() {
            setHostPanel(this.id.replace('HostButton', ''));
        };
    }
}

function init() {
    setHostbarButtonEvents();

    bttv.init();
}

module.exports = {
    init: init,
    setHostPanel: setHostPanel
};