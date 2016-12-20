'use strict';

function setOptionsPanel(panelName) {
    var panels = document.getElementsByClassName('panel');
    var navbarButtons = document.getElementsByClassName('navButton');

    for (var i = 0; i < panels.length; ++i) {
        var nextPanel = panels[i];

        if (nextPanel.id === panelName + 'Panel') {
            nextPanel.style.display = 'inline';
        } else {
            nextPanel.style.display = 'none';
        }
    }

    for (var j = 0; j < navbarButtons.length; ++j) {
        var nextButton = navbarButtons[j];

        if (nextButton.id === panelName + 'NavButton') {
            nextButton.className = 'active navButton';
        } else {
            nextButton.className = 'navButton';
        }
    }
}

function setNavbarButtonEvents() {
    var navbarButtons = document.getElementsByClassName('navButton');

    for (var i = 0; i < navbarButtons.length; ++i) {
        navbarButtons[i].onclick = function() {
            setOptionsPanel(this.id.replace('NavButton', ''));
        };
    }
}

module.exports = {
    setNavbarEvents: setNavbarButtonEvents,
    setOptionsPanel: setOptionsPanel
};