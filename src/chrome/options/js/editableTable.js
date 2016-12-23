'use strict';
var $ = require('jquery');


var PLUGIN_NAME = 'EditableTable';
var BASE64_PREFIX = 'data:image/png;base64,';
var ADD_ROW_BUTTON_PROPERTIES = {
    type: 'button',
    class: 'addRowButton'
};
var DELETE_ROW_BUTTON_PROPERTIES = {
    type: 'button',
    class: 'deleteRowButton'
};
var BROWSE_BUTTON_PROPERTIES = {
    type: 'button',
    class: 'browseButton',
    value: 'Browse'
};
var EMOTE_PROPERTIES = {
    class: 'GTEEmote'
};


var METHODS = {
    init: function() {
        this.$thead = $('<thead>');
        this.$tbody = $('<tbody>');

        this.$node.append(this.$thead);
        this.$node.append(this.$tbody);

        this._createHeader();
    },
    _createHeader: function() {
        var $tr = $('<tr>');
        var $addRowButton = $('<input>', ADD_ROW_BUTTON_PROPERTIES);

        $addRowButton.click(function() {
            this._addRow();
        }.bind(this));

        for (var i = 0; i < this.options.columns.length; ++i) {
            $tr.append($('<th>').text(this.options.columns[i].displayName));
        }

        $tr.append($('<th>', {class: 'controlCell'}).append($addRowButton));
        this.$thead.append($tr);
    },
    _addRow: function() {
        var $tr = $('<tr>');
        var $deleteRowButton = $('<input>', DELETE_ROW_BUTTON_PROPERTIES);

        $deleteRowButton.click(function() {
            this.remove();
        }.bind($tr));

        for (var i = 0; i < this.options.columns.length; ++i) {
            var nextCol = this.options.columns[i];
            var $td = $('<td>', {class: nextCol.name});
            var $input = $('<input>', {
                type: nextCol.type
            });

            if (nextCol.type === 'emote') {
                var $browseButton = $('<input>', BROWSE_BUTTON_PROPERTIES);
                $input = $('<img>', EMOTE_PROPERTIES);

                $browseButton.click($input, function(event) {
                    var emoteBrowser = $('#emoteBrowser');

                    emoteBrowser.data('emote', event.data);
                    emoteBrowser.trigger('click');
                });

                $td.append($browseButton);
            } else if (nextCol.type === 'select') {
                $input = $('<select>');

                if (nextCol.onchange) {
                    $input.change({
                        row: $tr,
                        callback: nextCol.onchange
                    }, function(event) {
                        event.data.callback(event.data.row, this.value);
                    });
                }

                for (var j = 0; j < nextCol.options.length; ++j) {
                    $input.append($('<option>', {value: nextCol.options[j]}).text(nextCol.options[j]));
                }
            }

            if (nextCol.placeholder != undefined) {
                $input.attr('placeholder', nextCol.placeholder);
            }

            $td.prepend($input);
            $tr.append($td);
        }

        $tr.append($('<td>', {class: 'controlCell'}).append($deleteRowButton));
        this.$tbody.append($tr);

        return $tr;
    },
    importData: function(entries) {
        this.$tbody.find('tr').remove();

        for (var i = 0; i < entries.length; ++i) {
            var entry = entries[i];
            var $newRow = this._addRow();

            for (var j = 0; j < this.options.columns.length; ++j) {
                var nextCol = this.options.columns[j];
                var $cell = $newRow.find('.' + nextCol.name).children().eq(0);

                if ($cell.prop('type') === 'text' || $cell.is('select')) {
                    $cell.val(entry[nextCol.name]);
                } else if ($cell.is('img')) {
                    $cell.attr('src', BASE64_PREFIX + entry[nextCol.name]);
                }

                $cell.trigger('change');
            }
        }
    },
    exportData: function() {
        var result = [];
        var $entries = this.$tbody.find('tr');


        for (var i = 0; i < $entries.length; ++i) {
            var $entry = $entries.eq(i);
            var exported = {};

            for (var j = 0; j < this.options.columns.length; ++j) {
                var nextCol = this.options.columns[j];
                var $cell = $entry.find('.' + nextCol.name).children().eq(0);

                if ($cell.prop('type') === 'text' || $cell.is('select')) {
                    exported[nextCol.name] = $cell.val();
                } else if ($cell.is('img')) {
                    var emoteSrc = $cell.attr('src') || '';

                    exported[nextCol.name] = emoteSrc.replace(BASE64_PREFIX, '');
                }
            }

            result.push(exported);
        }

        return result;
    },
    getOptions: function() {
        return this.options;
    }
};

module.exports = function($) {
    function EditableTable(node, options) {
        this.$node = $(node);

        this.options = options;
        this._name = PLUGIN_NAME;
        this.init();
    }

    $.extend(EditableTable.prototype, METHODS);

    $.fn[PLUGIN_NAME] = function(options) {
        var args = arguments;

        if (options === undefined || typeof options === 'object') {
            return this.each(function() {
                if (!$.data(this, 'plugin_' + PLUGIN_NAME)) {
                    $.data(this, 'plugin_' + PLUGIN_NAME, new EditableTable(this, options));
                }
            });
        } else if (typeof options === 'string' && options[0] !== '_' && options !== 'init') {
            var returns;

            this.each(function() {
                var instance = $.data(this, 'plugin_' + PLUGIN_NAME);

                if (instance instanceof EditableTable && typeof instance[options] === 'function') {
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