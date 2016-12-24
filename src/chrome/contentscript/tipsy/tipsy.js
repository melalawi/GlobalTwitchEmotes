'use strict';
var Utils = require('./utils.js');


const defaults = {
    className: null,
    delayIn: 0,
    delayOut: 0,
    fade: false,
    fallback: '',
    gravity: 's',
    html: true,
    offset: 0,
    opacity: 1,
    title: 'title',
    trigger: 'hover'
};

var tipsyObserver;

class Tipsy {
    constructor(element, options) {
        this.element = element;
        this.options = Utils.extend({}, defaults, options || {});
        this.enabled = true;

        this.fixTitle();
        this.attachEvents();
    }

    // Static API
    static bind(element, options) {
        if (element && !element.tipsy) {
            element.tipsy = new Tipsy(element, options);
        }
    }

    static bindSelector(selector, options, node) {
        node = node || document;

        let elements = node.querySelectorAll(selector);
        [].forEach.call(elements, function(element) {
            Tipsy.bind(element, options);
        });
    }

    static watchSelector(selector, options, node) {
        node = node || document;
        Tipsy.bindSelector(selector, options, node);

        tipsyObserver = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                let addedNodes = mutation.addedNodes;
                if (addedNodes && addedNodes.length) {
                    [].forEach.call(addedNodes, function (node) {
                        if (node.matches(selector)) {
                            Tipsy.bind(node, options);
                            return;
                        }

                        let elements = node.querySelectorAll(selector);
                        [].forEach.call(elements, function (element) {
                            Tipsy.bind(element, options);
                        });
                    });
                }
            });
        });
        tipsyObserver.observe(node, {childList: true, subtree: true});
    }

    static autoNS() {
        let offset = Utils.offset(this);

        return offset.top > (document.body.scrollTop + window.innerHeight / 2) ? 's' : 'n';
    }

    static autoWE() {
        let offset = Utils.offset(this);

        return offset.left > (document.body.scrollLeft + window.innerWidth / 2) ? 's' : 'n';
    }

    // Public API
    enable() {
        this.enabled = true;
    }

    disable() {
        this.enabled = false;
    }

    show() {
        let title = this.getTitle();

        if (!title || !this.enabled) return;

        let gravity = Utils.callOrReturn(this.options.gravity, this.element);
        let tip = this.getTip();
        let tipArrow = tip.querySelector('.tipsy-arrow');

        tip.querySelector('.tipsy-inner')[this.options.html ? 'innerHTML' : 'textContent'] = title;
        this.resetTip();

        document.body.appendChild(tip);

        Utils.css(tip, this.calculateTipPosition(tip, gravity));
        Utils.css(tipArrow, this.calculateTipArrowPosition(tip, tipArrow, gravity));

        tip.classList.add('tipsy-' + gravity);
        tipArrow.className = 'tipsy-arrow tipsy-arrow-' + gravity.charAt(0);
        if (this.options.className) {
            tip.classList.add(Utils.callOrReturn(this.options.className, this.element));
        }

        Utils.css(tip, {visibility: 'visible', opacity: this.options.opacity});
    }

    hide() {
        let tip = this.getTip();

        if (this.options.fade) {
            tip.addEventListener('transitionend', this.onTransitionEnd);
            tip.style.opacity = 0;
        } else {
            tip.remove();
        }
    }

    validate() {
        if (!this.element.parentNode) {
            this.hide();
            this.element = null;
            this.options = null;
        }
    }

    // Private methods
    attachEvents() {
        // Fix event binding
        this.onEnter = this.onEnter.bind(this);
        this.onLeave = this.onLeave.bind(this);
        this.onTransitionEnd = this.onTransitionEnd.bind(this);

        if (this.options.trigger != 'manual') {
            let eventIn  = this.options.trigger == 'hover' ? 'mouseenter' : 'focus';
            let eventOut = this.options.trigger == 'hover' ? 'mouseleave' : 'blur';

            this.element.addEventListener(eventIn, this.onEnter);
            this.element.addEventListener(eventOut, this.onLeave);
        }
    }

    onEnter() {
        let self = this;

        this.hoverState = 'in';
        if (this.options.delayIn == 0) {
            this.show();
        } else {
            setTimeout(function() {
                if (self.hoverState == 'in') {
                    self.show();
                }
            }, this.options.delayIn);
        }
    }

    onLeave() {
        let self = this;

        this.hoverState = 'out';
        if (this.options.delayOut == 0) {
            this.hide();
        } else {
            setTimeout(function() {
                if (self.hoverState == 'out') {
                    self.hide();
                }
            }, this.options.delayOut);
        }
    }

    onTransitionEnd(event) {
        event.target.removeEventListener('transitionend', this.onTransitionEnd);
        event.target.remove();
    }

    calculateTipPosition(tip, gravity) {
        let actualWidth = tip.offsetWidth;
        let actualHeight = tip.offsetHeight;
        let pos = Utils.extend({}, Utils.offset(this.element), {
            height: this.element.offsetHeight,
            width: this.element.offsetWidth
        });
        let tipPos;

        switch (gravity.charAt(0)) {
            case 'n':
                tipPos = {top: pos.top + pos.height + this.options.offset, left: pos.left + pos.width / 2 - actualWidth / 2};
                break;

            case 's':
                tipPos = {top: pos.top - actualHeight - this.options.offset, left: pos.left + pos.width / 2 - actualWidth / 2};
                break;

            case 'e':
                tipPos = {top: pos.top + pos.height / 2 - actualHeight / 2, left: pos.left - actualWidth - this.options.offset};
                break;

            case 'w':
                tipPos = {top: pos.top + pos.height / 2 - actualHeight / 2, left: pos.left + pos.width + this.options.offset};
                break;
        }

        if (gravity.length == 2) {
            if (gravity.charAt(1) == 'w') {
                tipPos.left = pos.left + pos.width / 2 - 15;
            } else {
                tipPos.left = pos.left + pos.width / 2 - actualWidth + 15;
            }
        }

        return tipPos;
    }

    // TODO Gravity
    calculateTipArrowPosition(tip, tipArrow, gravity) {
        let actualWidth = tip.offsetWidth;
        let actualHeight = tip.offsetHeight;
        let tipPos;

        tipPos = {
            left: actualWidth / 2,
            top: actualHeight
        };

        return tipPos;
    }

    getTitle() {
        let title;
        let options = this.options;

        this.fixTitle();

        if (typeof options.title == 'string') {
            title = this.element.getAttribute(options.title == 'title' ? 'original-title' : options.title);
        } else if (typeof options.title == 'function') {
            title = options.title.call(this.element);
        }

        title = ('' + title).replace(/(^\s*|\s*$)/, "");

        return title || options.fallback;
    }

    getTip() {
        if (!this.tip) {
            this.tip = document.createElement('div');
            this.tip.classList.add('tipsy');
            this.tip.classList.add('GTETipsy');
            this.tip.innerHTML = '<div class="GTETipsy tipsy-arrow" style="position:absolute;width:0;height:0;line-height:0;border:5px solid transparent;opacity:0.8;"></div><div class="GTETipsy tipsy-inner" style="font-size:12.5px;line-height:18px;font-family:\'Helvetica Neue\',Helvetica,sans-serif;background-color:rgba(0,0,0,0.8);color:#FFF;max-width:200px;padding:5px 8px 4px;text-align:center;white-space:pre-wrap;"></div>';
            this.tip.pointee = this.element;

            if (this.options.fade) {
                this.tip.style.transition = 'opacity .25s';
            }
        }

        return this.tip;
    }

    resetTip() {
        if (this.tip) {
            this.tip.remove();

            this.tip.className = 'GTETipsy tipsy';
            this.tip.removeEventListener('transitionend', this.onTransitionEnd);
            Utils.css(this.tip, {top: 0, left: 0, display: 'block', 'border-radius': '0px !important', opacity: 0, visibility: 'hidden', 'font-size':'12px', position:'absolute', padding:'5px', 'z-index': 100000});
        }
    }

    fixTitle() {
        let title = this.element.getAttribute('title');
        let originalTitle = this.element.getAttribute('original-title');

        if (title || typeof(originalTitle) != 'string') {
            this.element.setAttribute('original-title', title || '');
            this.element.removeAttribute('title');
        }
    }
}

module.exports = Tipsy;