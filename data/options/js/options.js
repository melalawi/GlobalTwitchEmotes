"use strict";

var settingsModifiers,
    grids = [];

function initialize() {
    settingsModifiers = $(document.body).find('.settingsModifier');

    //about page version number
    $('.version').text('Version ' + getVersionNumber());


    //set main page and emote page
    setTab($('#settings'));
    setTab($('#twitch'));

    initializeTables($('table.settingsModifier'));

    $('.tabSelector').click(function() {
        setTab($(this));
    });

    $('.triggerButton[name="saveButton"]').click(function(){
        saveGeneralSettings();
    });

    loadGeneralSettings();
}

function setTab(button) {
    var tabClass = button.data('tabgroup');

    $('.' + tabClass).css('display', 'none');

    $('.' + tabClass + '#' + button.attr('id') + 'Tab').css('display', '');

    $("[data-tabgroup='" + tabClass + "']").removeClass('active');

    $(button).addClass('active');
}

function saveGeneralSettings() {
    var data = {};

    //make loaders visible, buttons disabled
    $('.triggerButton[name="saveButton"]').attr("disabled", true);
    $('.loader').css('display', 'inline-block');

    settingsModifiers.each(function(){
        if ($(this).prop('type') === "checkbox") {
            data[this.id] = $(this).prop('checked');
        } else if ($(this).prop('type') === "number") {
            data[this.id] = parseInt($(this).val());
        } else if ($(this).prop('tagName') === "TEXTAREA") {
            var stringToArray = $(this).val().split('\n');

            //don't keep empty strings
            stringToArray = stringToArray.filter(function(key){ return key !== ''; });

            data[this.id] = stringToArray;
        } else if ($(this).prop('tagName') === "SELECT") {
            var savedObject = {};

            savedObject[$(this).data('objectname')] = this.options[this.selectedIndex].value;

            data[this.id] = [];

            data[this.id].push(savedObject);
        } else if ($(this).data('radiogroup')) {
            data[this.id] = $(this).find('input:radio:checked').val();
        } else if ($(this).prop('tagName') === 'TABLE') {
            data[this.id] = $(this).appendGrid('getAllValue', false);
        }
    });

    setData(data, function(){
        $('.triggerButton[name="saveButton"]').attr("disabled", false);
        $('.loader').css('display', 'none');

        alert('Settings Saved!');
    });
}

function loadGeneralSettings() {
    getData(function(data) {
        if (data) {
            $.each(data, function(key) {
                var element = settingsModifiers.filter('#' + key);

                if (element) {
                    if (element.prop('type') === "checkbox") {
                        element.prop('checked', this.valueOf());
                    } else if (element.prop('type') === "number") {
                        element.val(this.valueOf());
                    } else if (element.prop('tagName') === "TEXTAREA") {
                        element.val(this.valueOf().join('\n'));
                    } else if (element.prop('tagName') === "SELECT") {
                        element.val(this.valueOf()[0][element.data('objectname')]);
                    } else if (element.data('radiogroup')) {
                        element.find('[value="' + this.valueOf() + '"]').prop('checked', true);
                    } else if (element.prop('tagName') === 'TABLE') {
                        element.appendGrid('load', this.valueOf());
                    }
                }
            });
        }
    });
}

function resetGeneralSettings() {
}

function initializeTables(nodes) {
    nodes.each(function(){
        var data = $(this).data('tableinfo')[0];

        data['hideButtons'] = {
            moveUp: true,
            moveDown: true,
            insert: true,
            removeLast: true
        };

        data['hideRowNumColumn'] = true;

        data['i18n'] = {
            append: 'Insert New Entry',
            remove: 'Delete Entry',
            rowEmpty: 'Nothing here!'
        };

        $(this).appendGrid(data);
    });
}