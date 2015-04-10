var bkgd = require("./bkgd.js");

var background;// = new Background('firefox');

exports.initialize = function() {
    background = bkgd.newBackground(firefox_interface);
    background.initialize();
};

var firefox_interface = {
    
    storage_access: function(on_load){
        var data = require("sdk/simple-storage").storage;
            
        data.use_global_emotes = (data.use_global_emotes ? data.use_global_emotes : true);
        data.use_subscriber_emotes = (data.use_subscriber_emotes ? data.use_subscriber_emotes : true);
        data.use_betterttv_emotes = (data.use_betterttv_emotes ? data.use_betterttv_emotes : false);

        data.replace_emotes_dynamically = (data.replace_emotes_dynamically ? data.replace_emotes_dynamically : true);

        data.use_twitch_smilies = (data.use_twitch_smilies ? data.use_twitch_smilies : false);
        data.twitch_smilies_mode = (data.twitch_smilies_mode ? data.twitch_smilies_mode : 'Robot');
        data.twitch_smilies_monkeys = (data.twitch_smilies_monkeys ? data.twitch_smilies_monkeys : false);

        data.emote_filter_mode = (data.emote_filter_mode ? data.emote_filter_mode : 'None');
        data.emote_filter_list = (data.emote_filter_list ? data.emote_filter_list : "");

        data.site_filter_mode = (data.site_filter_mode ? data.site_filter_mode : 'None');
        data.site_filter_list = (data.site_filter_list ? data.site_filter_list : "");

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
    
    script_injector: function(tab, on_load, data) {
        var worker = 
            tab.attach({
                contentScriptFile: ['./contentscript.js', './firefox_content.js'],
                onAttach: function(window) {
                    worker.port.emit("data", data);
                    //done with it
                    on_load();
                }
            });
    }
    
};

//tab somewhere finished loading, attempt to push it into the queue
require("sdk/tabs").on('ready', function(tab) {
    background.add_tab(tab, tab.url);
});

//if settings changes, reinitialize
//no inherent storage change listener in firefox addon-sdk that i'm aware of
//will just use a function that is called when settings are saved (main.js)
exports.onStorageChange = function() {
    exports.initialize();
};