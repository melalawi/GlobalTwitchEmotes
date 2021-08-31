var bttv = require('./bttvSubpanel');
var ffz = require('./ffzSubpanel');
var seventv = require('./seventvSubpanel');
var twitchChannels = require('./twitchSubpanel');
var customEmotes = require('./customEmotesSubpanel');


function setHostPanel(panelName) {
    var panels = document.getElementsByClassName('subpanel');
    var hostButtons = document.getElementsByClassName('hostButton');

    for (var i = 0; i < panels.length; ++i) {
        var nextPanel = panels[i];

        if (nextPanel.id === panelName + 'Subpanel') {
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
        hostButtons[i].onclick = assignHostPanel;
    }
}

function assignHostPanel() {
    setHostPanel(this.id.replace('HostButton', ''));
}

function init() {
    setHostbarButtonEvents();

    bttv.init();
    ffz.init();
    seventv.init();
    twitchChannels.init();
    customEmotes.init();
}

module.exports = {
    init: init,
    setHostPanel: setHostPanel
};