'use strict';
var pageObserver = require('./pageObserver');


var OUTER_TIPSY_CSS = 'display:block !important;position:absolute !important;opacity:1 !important;z-index:9999999 !important;visibility:visible !important;word-break:break-all !important;padding:5px !important;box-sizing:border-box !important;';
var INNER_TIPSY_CSS = 'display:block !important;position:static !important;background:rgba(0,0,0,0.8) !important;visibility:visible !important;font-size:12px !important;line-height:12px !important;font-family:Arial !important;color:#FFFFFF !important;max-width:200px !important;padding:5px 8px 4px !important;text-align:center !important;';
var ARROW_TIPSY_CSS = 'display:block !important;position:absolute !important;width:0 !important;height:0 !important;border:5px solid transparent !important;right:10px !important;opacity: 0.8 !important;background-color:rgba(0,0,0,0) !important;box-sizing:border-box !important;';
var SOUTH_TIPSY_ARROW_CSS = ARROW_TIPSY_CSS + 'top:0 !important;border-top:none !important;border-bottom-color:#000000 !important;';
var NORTH_TIPSY_ARROW_CSS = ARROW_TIPSY_CSS + 'bottom:0 !important;border-bottom:none !important;border-top-color:#000000 !important;';
var TIPSY_DATA_ATTRIBUTE = 'gte-tipsy-text';
var tipsyVisible = false;
var tipsy = null;


function init() {
    if (tipsy === null) {
        pageObserver.onNewWindow(attachEventListener);

        createTipsy();
    }
}

function attachEventListener(body) {
    body.addEventListener('mouseover', mouseoverEventHandler);
}

function mouseoverEventHandler(event) {
    if (event.target.className === 'GTEEmote') {
        showTipsy(event.target);
    } else {
        hideTipsy();
    }
}

function createTipsy() {
    tipsy = {};

    tipsy.outer = document.createElement('div');
    tipsy.outer.className = 'GTETipsy';
    tipsy.outer.style.cssText = OUTER_TIPSY_CSS;

    tipsy.inner = document.createElement('div');
    tipsy.inner.className = 'GTETipsyInner';
    tipsy.inner.style.cssText = INNER_TIPSY_CSS;

    tipsy.arrow = document.createElement('div');
    tipsy.arrow.className = 'GTETipsyArrow';

    tipsy.outer.appendChild(tipsy.inner);
    tipsy.outer.appendChild(tipsy.arrow);

    tipsy.containingDocument = null;
}

function showTipsy(emoteNode) {
    tipsyVisible = true;

    if (emoteNode.title !== '') {
        emoteNode.setAttribute(TIPSY_DATA_ATTRIBUTE, emoteNode.getAttribute(TIPSY_DATA_ATTRIBUTE).replace('\n', '<br style="line-height:18px !important;">'));
        emoteNode.removeAttribute('title');
    }

    tipsy.inner.innerHTML = emoteNode.getAttribute(TIPSY_DATA_ATTRIBUTE) || 'null';
    tipsy.containingDocument = emoteNode.ownerDocument.body;
    tipsy.containingDocument.appendChild(tipsy.outer);

    positionTipsy(emoteNode);
}

function hideTipsy() {
    if (tipsyVisible === true) {
        tipsyVisible = false;

        tipsy.containingDocument.removeChild(tipsy.outer);
    }
}

function positionTipsy(emoteNode) {
    var bodyScrollTop = document.documentElement.scrollTop || document.body.scrollTop;
    var bodyScrollLeft = document.documentElement.scrollLeft || document.body.scrollLeft;
    var actualWidth = tipsy.outer.offsetWidth;
    var actualHeight = tipsy.outer.offsetHeight;

    var offset = {
        top: emoteNode.getBoundingClientRect().top + bodyScrollTop,
        left: emoteNode.getBoundingClientRect().left + bodyScrollLeft
    };
    var emotePosition = {
        top: offset.top,
        left: offset.left,
        height: emoteNode.offsetHeight,
        width: emoteNode.offsetWidth
    };

    var forceTipsySouth = (offset.top - actualHeight) < bodyScrollTop;


    if (forceTipsySouth === false) {
        tipsy.outer.style.top = (emotePosition.top - actualHeight) + 'px';
        tipsy.arrow.style.cssText = NORTH_TIPSY_ARROW_CSS;
    } else {
        tipsy.outer.style.top = (emotePosition.top + emotePosition.height) + 'px';
        tipsy.arrow.style.cssText = SOUTH_TIPSY_ARROW_CSS;
    }

    tipsy.outer.style.left = (emotePosition.left + emotePosition.width / 2 - actualWidth + 15) + 'px';
}

module.exports = {
    init: init
};