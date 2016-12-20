'use strict';
var $ = require('jquery');


var BASE64_PREFIX = 'data:image/png;base64,';
var ADD_ROW_BUTTON_PROPERTIES = {
    type: 'button',
    class: 'addRowButton',
    value: '+'
};
var DELETE_ROW_BUTTON_PROPERTIES = {
    type: 'button',
    class: 'deleteRowButton',
    value: '-'
};


function init(options) {
    this.columns = options.columns;

    this.thead = $('<thead>');
    this.tbody = $('<tbody>');

    this.append(this.thead);
    this.append(this.tbody);

    createHeader.apply(this);

    return this;
}

function createHeader() {
    var tr = $('<tr>');
    var addRowButton = $('<input>', ADD_ROW_BUTTON_PROPERTIES);

    addRowButton.click(function() {
        addRow.apply(this);
    }.bind(this));

    for (var i = 0; i < this.columns.length; ++i) {
        tr.append($('<th>').text(this.columns[i].displayName));
    }

    tr.append($('<th>').append(addRowButton));
    this.thead.append(tr);
}

function addRow() {
    var tr = $('<tr>');
    var deleteRowButton = $('<input>', DELETE_ROW_BUTTON_PROPERTIES);

    deleteRowButton.click(function() {
        this.remove();
    }.bind(tr));

    for (var i = 0; i < this.columns.length; ++i) {
        var nextCol = this.columns[i];
        var td = $('<td>', {class: nextCol.name});
        var input = $('<input>', {
            type: nextCol.type
        });

        if (nextCol.type === 'emote') {
            input = $('<img>');
        }

        if (nextCol.placeholder != undefined) {
            input.attr('placeholder', nextCol.placeholder);
        }

        td.append(input);
        tr.append(td);
    }

    tr.append($('<td>').append(deleteRowButton));
    this.tbody.append(tr);

    return tr;
}

function importData(entries) {
    this.tbody.find('tr').remove();

    for (var i = 0; i < entries.length; ++i) {
        var entry = entries[i];
        var newRow = addRow.apply(this);

        for (var j = 0; j < this.columns.length; ++j) {
            var nextCol = this.columns[j];
            var cell = newRow.find('.' + nextCol.name).children().eq(0);

            if (cell.prop('type') === 'text') {
                cell.val(entry[nextCol.name]);
            } else if (cell.is('img')) {
                cell.attr('src', BASE64_PREFIX + entry[nextCol.name]);
            }
        }
    }
}

function exportData() {
    var result = [];
    var entries = this.tbody.find('tr');


    for (var i = 0; i < entries.length; ++i) {
        var entry = entries.eq(i);
        var exported = {};

        for (var j = 0; j < this.columns.length; ++j) {
            var nextCol = this.columns[j];
            var cell = entry.find('.' + nextCol.name).children().eq(0);

            if (cell.prop('type') === 'text') {
                exported[nextCol.name] = cell.val();
            } else if (cell.is('img')) {
                exported[nextCol.name] = cell.attr('src').replace(BASE64_PREFIX, '');
            }
        }

        result.push(exported);
    }

    return result;
}

var methods = {
    importData: importData,
    exportData: exportData
};

module.exports = function($) {
    $.fn.EditableTable = function(options) {
        if (methods[options]) {
            return methods[options].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof options === 'object' || !options) {
            return init.apply(this, arguments);
        }
    };
};