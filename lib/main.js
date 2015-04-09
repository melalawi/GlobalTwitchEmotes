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
        url: require("sdk/self").data.url("./options/settings.html"),
        onReady: function(tab) {
            var data_transfer = tab.attach( { contentScriptFile: [
                    
                            "./options/js/jquery-2.1.3.min.js",
                            "./options/js/main.js",
                            "./options/js/settings.js",
                            "./options/js/emotes.js",
                            "./options/js/sites.js"
                            
                        ] });
                    
            data_transfer.port.on("save_general_data", function(data){
                simple_storage.storage.use_global_emotes = data.use_global_emotes;
                simple_storage.storage.use_subscriber_emotes = data.use_subscriber_emotes;
                simple_storage.storage.use_betterttv_emotes = data.use_betterttv_emotes;
                simple_storage.storage.replace_emotes_dynamically = data.replace_emotes_dynamically;
                simple_storage.storage.use_twitch_smilies = data.use_twitch_smilies;
                simple_storage.storage.twitch_smilies_mode = data.twitch_smilies_mode;
                simple_storage.storage.twitch_smilies_monkeys = data.twitch_smilies_monkeys;

                console.log("Saved");
            });

            data_transfer.port.on("give_data", function(){
                console.log("Contact Made.");
                data_transfer.port.emit("load_data", simple_storage.storage);
            });
        }
        
        
    });
    
   
});

