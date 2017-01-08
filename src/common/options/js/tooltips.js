var $ = require('jquery');


// Source: http://www.stoimen.com/blog/
$.fn.clickoutside = function(callback) {
    var outside = 1, self = $(this);

    self.cb = callback;

    this.click(function() {
        outside = 0;
    });

    $(document).click(function() {
        if (outside) {
            self.cb();
        }

        outside = 1;
    });

    return $(this);
};


var PLUGIN_NAME = 'Tooltip';
var METHODS = {
    init: function() {
        this._createTooltip();
        this._assignClickEvents();
    },
    _createTooltip: function() {
        this.$tooltip = $('<div>', {class: 'tooltip'});
        this.$inner = $('<div>', {class: 'tooltipInner'}).html(this.$htmlNode.html());

        this.$tooltip.append(this.$inner);
    },
    _assignClickEvents: function() {
        this.$triggerNode.on('click', this, function(event) {
            event.data._show();
        });

        this.$triggerNode.clickoutside(function() {
            this._hide();
        }.bind(this));
    },
    _show: function() {
        $(this.$triggerNode).append(this.$tooltip);

        this._positionTooltip();
    },
    _hide: function() {
        this.$tooltip.remove();
    },
    _positionTooltip: function() {
        var offset = {
            top: this.$triggerNode[0].getBoundingClientRect().top + document.body.scrollTop,
            left: this.$triggerNode[0].getBoundingClientRect().left + document.body.scrollLeft
        };
        var triggerPosition = {
            top: offset.top,
            left: offset.left,
            height: this.$triggerNode.outerHeight(),
            width: this.$triggerNode.outerWidth()
        };

        this.$tooltip.css('top', (triggerPosition.top + triggerPosition.height + 3) + 'px');
        this.$tooltip.css('left', (triggerPosition.left + triggerPosition.width + 3) + 'px');
    }
};

module.exports = function($) {
    function Tooltip(node) {
        this.$triggerNode = $(node);
        this.$htmlNode = $(this.$triggerNode.data('tooltip-html'));

        this._name = PLUGIN_NAME;
        this.init();
    }

    $.extend(Tooltip.prototype, METHODS);

    $.fn[PLUGIN_NAME] = function(options) {
        var args = arguments;

        if (options === undefined || typeof options === 'object') {
            return this.each(function() {
                if (!$.data(this, 'plugin_' + PLUGIN_NAME)) {
                    $.data(this, 'plugin_' + PLUGIN_NAME, new Tooltip(this, options));
                }
            });
        } else if (typeof options === 'string' && options[0] !== '_' && options !== 'init') {
            var returns;

            this.each(function() {
                var instance = $.data(this, 'plugin_' + PLUGIN_NAME);

                if (instance instanceof Tooltip && typeof instance[options] === 'function') {
                    returns = instance[options].apply(instance, Array.prototype.slice.call(args, 1));
                }

                if (options === 'destroy') {
                    $.data(this, 'plugin_' + PLUGIN_NAME, null);
                }
            });

            return returns !== undefined ? returns : this;
        }
    };
};