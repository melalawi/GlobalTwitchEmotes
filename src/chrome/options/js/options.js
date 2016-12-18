'use strict';

function init() {
    setOptionsPanel('generalOptionsPanel');
}

function setOptionsPanel(panelClassName) {
    var panels = document.getElementsByClassName('optionsPanel');
    var navbarButtons = document.getElementsByClassName('navButton');

    for (var i = 0; i < panels.length; ++i) {
        panels[i].style.display = 'none';
        navbarButtons[i].style.display = 'none';
    }

    document.query(panelClassName);
}

document.addEventListener('DOMContentLoaded', init, false);