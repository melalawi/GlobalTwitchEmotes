var bkgd = require("bkgd");

var background;// = new Background('firefox');

var tabs = require("sdk/tabs");

var { attach, detach } = require('sdk/content/mod');
var { Style } = require('sdk/stylesheet/style');

var tipsy_stylesheet = Style({
    uri: './css/tipsy.css'
});

var callback_listener;

exports.initialize = function() {
    background = bkgd.newBackground(firefox_interface);
    background.initialize();
};

var firefox_interface = {
    
    storage_access: function(on_load){
        var data = require("sdk/simple-storage").storage;
            
        data.use_global_emotes = (data.use_global_emotes !== undefined ? data.use_global_emotes : true);
        data.use_subscriber_emotes = (data.use_subscriber_emotes !== undefined ? data.use_subscriber_emotes : true);
        data.use_betterttv_emotes = (data.use_betterttv_emotes !== undefined ? data.use_betterttv_emotes : false);

        data.replace_emotes_dynamically = (data.replace_emotes_dynamically !== undefined ? data.replace_emotes_dynamically : true);
        data.case_sensitive = (data.case_sensitive  !== undefined ? data.case_sensitive : true);
        
        data.use_tipsy = (data.use_tipsy !== undefined ? data.use_tipsy : true);
        data.override_maki = (data.override_maki  !== undefined ? data.override_maki : false);

        data.use_twitch_smilies = (data.use_twitch_smilies !== undefined ? data.use_twitch_smilies : false);
        data.twitch_smilies_mode = (data.twitch_smilies_mode !== undefined ? data.twitch_smilies_mode : 'Robot');
        data.twitch_smilies_monkeys = (data.twitch_smilies_monkeys !== undefined ? data.twitch_smilies_monkeys : false);

        data.emote_filter_mode = (data.emote_filter_mode !== undefined ? data.emote_filter_mode : 'None');
        data.emote_filter_list = (data.emote_filter_list !== undefined ? data.emote_filter_list : "");

        data.site_filter_mode = (data.site_filter_mode !== undefined ? data.site_filter_mode : 'None');
        data.site_filter_list = (data.site_filter_list !== undefined ? data.site_filter_list : "");

        on_load(data);
    },
    
    json_parser: function(url, on_load) {
        var json;
        var REQUEST = require("sdk/request").Request({
            url: url,
            overrideMimeType: "text/plain; charset=latin1",
            onComplete: function(response) {
                json = JSON.parse(response.text);
                on_load(json);
            }
        });

        REQUEST.get();
    },
    
    script_injector: function(tab, send_tipsy, data) {
        var content_scripts = [
            require("sdk/self").data.url('html-sanitizer-minified.js'),
            require("sdk/self").data.url('contentscript.js'),
            require("sdk/self").data.url('firefox_content.js')
        ];
        
        if (send_tipsy) {
            content_scripts.unshift(
                require("sdk/self").data.url('jquery-2.1.3.min.js'),
                require("sdk/self").data.url('jquery.tipsy.js')
            );
        }
        
        var worker = tab.attach({
            attachTo: ["existing", "top"],
            contentScriptFile: content_scripts,
            onAttach: function(window) {
                if (send_tipsy) {
                    attach(tipsy_stylesheet, tab);
                }
                
                worker.port.emit("data", data);
            }
        });
        
    },
    
    tab_listener: function(on_found) {
        //if a listener exists, remove it and make a new one (fixes double injection bug that is introduced with settings change)
        if (callback_listener) {
            require("sdk/tabs").removeListener('ready', callback_listener);
        }
        
        callback_listener = function(tab) {
            if (tab.url) {
                on_found(tab, tab.url);
            }
        };
        
        //tab somewhere finished loading, attempt to inject scripts / send messages / whatnot
        require("sdk/tabs").on('ready', callback_listener);
    }
    
};

//if settings changes, reinitialize
//no inherent storage change listener in firefox addon-sdk that i'm aware of
//will just use a function that is called when settings are saved (main.js)
exports.onStorageChange = function() {
    background = bkgd.newBackground(firefox_interface);
    background.initialize();
};