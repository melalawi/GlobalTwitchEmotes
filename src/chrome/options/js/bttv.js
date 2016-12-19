'use strict';
var table;


function buildTable() {
    table = document.getElementById('bttvChannelList');
    document.querySelector('#bttvChannelList .addRowButton').onclick = addEmptyRow;
}

function addEmptyRow() {
    var tr = document.createElement('tr');
    var td = document.createElement('td');

    td.textContent = 'Click to Insert Channel Name';

    tr.appendChild(td);
    table.appendChild(tr);
}

module.exports = {
    init: buildTable
};