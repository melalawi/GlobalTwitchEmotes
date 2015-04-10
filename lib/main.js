var background = require("./firefox_bkgd.js");
var simple_prefs = require("sdk/simple-prefs");
var simple_storage = require("sdk/simple-storage");

background.initialize();

/*
var worker = page_mod.PageMod({
    include: "*",
    contentScriptFile: "./contentscript.js"
});
*/
//options
simple_prefs.on("accessSettings", function() {
    require("sdk/tabs").open({
        url: require("sdk/self").data.url("./options/options.html"),
        onReady: function(tab) {
            var data_transfer = tab.attach( { contentScriptFile: [
                            "./options/js/jquery-2.1.3.min.js",
                            "./options/js/options.js",
                            "./options/js/options_firefox.js"]
            });
                    
            data_transfer.port.on("set_data", function(data){
                simple_storage.storage.use_global_emotes = data.use_global_emotes;
                simple_storage.storage.use_subscriber_emotes = data.use_subscriber_emotes;
                simple_storage.storage.use_betterttv_emotes = data.use_betterttv_emotes;
                
                simple_storage.storage.replace_emotes_dynamically = data.replace_emotes_dynamically;
                simple_storage.storage.use_tipsy = data.use_tipsy;
                simple_storage.storage.override_maki = data.override_maki;
                
                simple_storage.storage.use_twitch_smilies = data.use_twitch_smilies;
                simple_storage.storage.twitch_smilies_mode = data.twitch_smilies_mode;
                simple_storage.storage.twitch_smilies_monkeys = data.twitch_smilies_monkeys;
                
                simple_storage.storage.emote_filter_mode = data.emote_filter_mode;
                simple_storage.storage.emote_filter_list = data.emote_filter_list;
        
                simple_storage.storage.site_filter_mode = data.site_filter_mode;
                simple_storage.storage.site_filter_list = data.site_filter_list;
                
                background.onStorageChange();
                
                data_transfer.port.emit("save_confirmed", "msg");
            });

            data_transfer.port.on("get_data", function(){
                //needs cleaning                
                simple_storage.storage.use_global_emotes = (simple_storage.storage.use_global_emotes ? simple_storage.storage.use_global_emotes : true);
                simple_storage.storage.use_subscriber_emotes = (simple_storage.storage.use_subscriber_emotes ? simple_storage.storage.use_subscriber_emotes : true);
                simple_storage.storage.use_betterttv_emotes = (simple_storage.storage.use_betterttv_emotes ? simple_storage.storage.use_betterttv_emotes : false);

                simple_storage.storage.replace_emotes_dynamically = (simple_storage.storage.replace_emotes_dynamically ? simple_storage.storage.replace_emotes_dynamically : true);
                simple_storage.storage.use_tipsy = (simple_storage.storage.use_tipsy ? simple_storage.storage.use_tipsy : true);
                simple_storage.storage.override_maki = (simple_storage.storage.override_maki ? simple_storage.storage.override_maki : false);

                simple_storage.storage.use_twitch_smilies = (simple_storage.storage.use_twitch_smilies ? simple_storage.storage.use_twitch_smilies : false);
                simple_storage.storage.twitch_smilies_mode = (simple_storage.storage.twitch_smilies_mode ? simple_storage.storage.twitch_smilies_mode : 'Robot');
                simple_storage.storage.twitch_smilies_monkeys = (simple_storage.storage.twitch_smilies_monkeys ? simple_storage.storage.twitch_smilies_monkeys : false);

                simple_storage.storage.emote_filter_mode = (simple_storage.storage.emote_filter_mode ? simple_storage.storage.emote_filter_mode : 'None');
                simple_storage.storage.emote_filter_list = (simple_storage.storage.emote_filter_list ? simple_storage.storage.emote_filter_list : "");

                simple_storage.storage.site_filter_mode = (simple_storage.storage.site_filter_mode ? simple_storage.storage.site_filter_mode : 'None');
                simple_storage.storage.site_filter_list = (simple_storage.storage.site_filter_list ? simple_storage.storage.site_filter_list : "");
                
                data_transfer.port.emit("data_received", simple_storage.storage);
            });
        }
        
        
    });
    
   
});

