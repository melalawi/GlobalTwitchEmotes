var background;

var callback_listener;

var chrome_interface = {
    
    storage_access: function(on_load){
        
        chrome.storage.local.get( {
            //defaults
            use_global_emotes: true,
            use_subscriber_emotes: true, 
            use_betterttv_emotes: false,

            replace_emotes_dynamically: true,
            case_sensitive: true,
            
            use_tipsy: true,
            override_maki: false,

            use_twitch_smilies: false,
            twitch_smilies_mode: 'Robot',
            twitch_smilies_monkeys: false,

            emote_filter_mode: "None",
            emote_filter_list: "",

            site_filter_mode: "None",
            site_filter_list: ""
        }, on_load);
    },
    
    json_parser: function(url, on_load) {
        
        var XML_REQUEST;
        var json;

        XML_REQUEST = new XMLHttpRequest();

        XML_REQUEST.open('GET', url);

        XML_REQUEST.onload = function() {
            json = JSON.parse(XML_REQUEST.responseText);
            on_load(json);
        };

        XML_REQUEST.send();

    },
    
    script_injector: function(tab, send_tipsy, data) {
        try {
            //nested script injectors, only way to load more than one script simultaneously on chrome
            //well technically not simultaneously
            if (send_tipsy === true) {
                chrome.tabs.executeScript(tab.id, {file: "./data/jquery-2.1.3.min.js"}, function(){
                    chrome.tabs.insertCSS(tab.id, {file: "./data/css/tipsy.css"}, function(){
                        chrome.tabs.executeScript(tab.id, {file: './data/jquery.tipsy.js'}, function(){
                            chrome.tabs.executeScript(tab.id, {file: './data/html-sanitizer-minified.js'}, function(){
                                chrome.tabs.executeScript(tab.id, {file: './data/contentscript.js'}, function(){
                                    chrome.tabs.executeScript(tab.id, {file: './data/chrome_content.js'}, function(){
                                        chrome.tabs.sendMessage(tab.id, data);
                                    });
                                });
                            });
                        });
                    });
                });
            } else {
                chrome.tabs.executeScript(tab.id, {file: './data/html-sanitizer-minified.js'}, function(){
                    chrome.tabs.executeScript(tab.id, {file: './data/contentscript.js'}, function(){
                        chrome.tabs.executeScript(tab.id, {file: './data/chrome_content.js'}, function(){
                            chrome.tabs.sendMessage(tab.id, data);
                        });
                    });
                });
            }
            
        } catch (runtime_exception) {
            console.log(runtime_exception);
        }
    },
    
    tab_listener: function(on_found) {
        //if a listener exists, remove it and make a new one (fixes double injection bug that is introduced with settings change
        if (callback_listener) {
            chrome.tabs.onUpdated.removeListener(callback_listener);
        }
        
        callback_listener = function(tab_id, info, tab) {
            
            if (tab.url && info.status === "complete") {
                on_found(tab, tab.url);

            }
            
        };
        
        //tab somewhere finished loading, attempt to inject scripts / send messages / whatnot
        chrome.tabs.onUpdated.addListener(callback_listener);
    }
};

function initialize() {
    background = new Background(chrome_interface);
    background.initialize();
}

initialize();

//if settings changes, reinitialize
chrome.storage.onChanged.addListener(function(changes, namespace) {
    initialize();
});

