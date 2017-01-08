var $ = require('jquery');


var PLUGIN_NAME = 'EditableTable';
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
    class: 'emote'
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
            this.self._deleteRow(this.row);
        }.bind({
            self: this,
            row: $tr
        }));

        this.$tbody.find('tr.nothingHere').remove();

        for (var i = 0; i < this.options.columns.length; ++i) {
            var nextCol = this.options.columns[i];
            var $td = $('<td>', {class: nextCol.name});
            var $input = $('<input>', {
                type: nextCol.type
            });

            if (nextCol.type === 'emote') {
                var $browseButton = $('<input>', BROWSE_BUTTON_PROPERTIES);
                var $emote = $('<img>', EMOTE_PROPERTIES);
                var $emoteError = $('<div>', {class: 'emoteError'}).text('No Emote');
                $input = $('<div>', {class: 'emoteContainer'});

                $browseButton.click($emote, this._onEmoteBrowseButtonClick);

                $emote.on('error', {
                    emoteError: $emoteError,
                    emote: $emote
                }, function(event) {
                    event.data.emote.attr('src', '');
                    event.data.emote.hide();

                    if (this.naturalWidth > 80 || this.naturalHeight > 80) {
                        event.data.emoteError.text('Emote too large');
                    } else {
                        event.data.emoteError.text('Invalid Emote');
                    }
                });

                $emote.on('load', {
                    emoteError: $emoteError,
                    emote: $emote
                }, function(event) {
                    if (this.naturalWidth > 80 || this.naturalHeight > 80) {
                        event.data.emote.attr('src', '');
                        event.data.emote.hide();
                    } else {
                        event.data.emote.show();
                        event.data.emoteError.text('');
                    }
                });

                $input.append($emote);
                $input.append($emoteError);
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

            if (nextCol.placeholder) {
                $input.attr('placeholder', nextCol.placeholder);
            }

            $td.prepend($input);
            $tr.append($td);
        }

        $tr.append($('<td>', {class: 'controlCell'}).append($deleteRowButton));
        this.$tbody.append($tr);

        return $tr;
    },
    _deleteRow: function(row) {
        row.remove();

        this._addDummyRow();
    },
    _addDummyRow: function() {
        var rows = this.$tbody.find('tr');

        if (rows.length === 0) {
            var $tr = $('<tr>', {class: 'nothingHere'});

            $tr.append($('<td>', {
                class: 'nothingHere',
                colspan: this.options.columns.length + 1
            }).text('Nothing here!'));

            this.$tbody.append($tr);
        }
    },
    _onEmoteBrowseButtonClick: function(event) {
        var emoteBrowser = $('#emoteBrowser');

        emoteBrowser.data('emote', event.data);
        emoteBrowser.trigger('click');
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
                } else if ($cell.hasClass('emoteContainer')) {
                    $cell.find('img').attr('src', entry[nextCol.name]);
                }

                $cell.trigger('change');
            }
        }

        this._addDummyRow();
    },
    exportData: function() {
        var result = [];
        var $entries = this.$tbody.find('tr:not(.nothingHere)');


        for (var i = 0; i < $entries.length; ++i) {
            var $entry = $entries.eq(i);
            var exported = {};

            for (var j = 0; j < this.options.columns.length; ++j) {
                var nextCol = this.options.columns[j];
                var $cell = $entry.find('.' + nextCol.name).children().eq(0);

                if ($cell.prop('type') === 'text' || $cell.is('select')) {
                    exported[nextCol.name] = $cell.val();
                } else if ($cell.hasClass('emoteContainer')) {
                    var emoteSrc = $cell.find('img').attr('src') || '';

                    exported[nextCol.name] = emoteSrc;
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