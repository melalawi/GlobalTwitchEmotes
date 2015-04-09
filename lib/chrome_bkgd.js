var chrome_interface = {
    
    storage_access: function(on_load){
        
        chrome.storage.sync.get( {
            //defaults
            use_global_emotes: true,
            use_subscriber_emotes: true, 
            use_betterttv_emotes: false,

            replace_emotes_dynamically: true,

            use_twitch_smilies: false,
            twitch_smilies_mode: 'Robot',
            twitch_smilies_monkeys: false,

            emote_filter_mode: "None",
            emote_filter_list: "",

            site_filter_mode: "None",
            site_filter_list: ""
        }, function(data) {
            on_load(data);
        });
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
    
    script_injector: function(tab, on_load, data) {
        //nested script injectors, only way to load more than one script on chrome
        chrome.tabs.executeScript(tab.id, {file: "./data/contentscript.js"}, function(){
            chrome.tabs.executeScript(tab.id, {file: './data/chrome_content.js'}, function(){
                chrome.tabs.sendMessage(tab.id, data);
                //done with it
                on_load();
            });
        });
    }
    
};

var background = new BackgroundManager(chrome_interface);
/*
chrome_interface.storage_access = function(on_load){
    chrome.storage.sync.get( {
        //defaults
        use_global_emotes: true,
        use_subscriber_emotes: true, 
        use_betterttv_emotes: false,

        replace_emotes_dynamically: true,

        use_twitch_smilies: false,
        twitch_smilies_mode: 'Robot',
        twitch_smilies_monkeys: false,

        emote_filter_mode: "None",
        emote_filter_list: "",

        site_filter_mode: "None",
        site_filter_list: ""
    }, function(data) {
        on_load(data);
    });
};

chrome_interface.json_parser = function(url, on_load) {
    var XML_REQUEST;
    var json;
    
    XML_REQUEST = new XMLHttpRequest();

    XML_REQUEST.open('GET', url);

    XML_REQUEST.onload = function() {
        json = JSON.parse(XML_REQUEST.responseText);
        on_load(json);
    };

    XML_REQUEST.send();
    
};

chrome_interface.script_injector = function(tab, on_load, data) {
    //nested script injectors, only way to load more than one script on chrome
    chrome.tabs.executeScript(tab.id, {file: "./data/contentscript.js"}, function(){
        chrome.tabs.executeScript(tab.id, {file: './data/chrome_content.js'}, function(){
            chrome.tabs.sendMessage(tab.id, data);
            //done with it
            on_load();
        });
    });
};*/

//tab somewhere finished loading, attempt to push it into the queue
chrome.tabs.onUpdated.addListener(function(tab_id, info, tab) {
    if (info.status === "complete") {
        background.add_tab(tab, tab.url);
    }
});

background.initialize();

//if settings changes, reinitialize
chrome.storage.onChanged.addListener(function(changes, namespace) {
    background = new Background('chrome');
    background.initialize();
});

