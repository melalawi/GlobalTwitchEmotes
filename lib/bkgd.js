//in order to bridge communications between background pages in firefox, the addon-sdk utilizes the predefined 'exports' object
//only the functions defined in exports can be 'exported' and used in the other background scripts
//'exports' does not exist in chrome, however, and as a result attempting to call it in chrome will result in a crash
//coupling... levels... rising

//if exports exists, define the background manager that will be accessed in firefox_bkgd.js
if (typeof exports === 'object') {
    exports.newBackground = function(interface) {
        return new Background(interface);
    };
}

//interface template
/*
var BrowserInterface = {
    storage_access: {
    }
    
    json_parser: {
    }
    
    script_injector: {
    }
    
    message_passer: {
    }
    
    get_all_tabs: {
    }
    
    get_url: {
    }
    
    tab_listener: {
    }
};
*/

var newline_regex = /\r\n|\n\r|\n|\r/g;
var address_regex = /^(about|resource:\/\/|chrome:\/\/|chrome-extension:\/\/|chrome-devtools:\/\/|http:\/\/www.twitch.tv)/;

function Background(browser_interface) {

    var local_settings = {};
    var emote_manager = {};
    
    var interface = browser_interface;
    
    this.initialize = function() {
        local_settings = new Settings(interface.storage_access, function(data){
            emote_manager.initialize(data, interface.json_parser);
        });
        
        emote_manager = new EmoteManager(function(){
            interface.tab_listener(add_tab);
        });
        local_settings.load_data();
    };
    
    function add_tab(tab) {
        inject_data(tab);
    };
    
    //inject scripts, send message
    function inject_data(tab) {
        if (tab && valid_url(interface.get_url(tab))) {
            interface.script_injector(tab, local_settings.use_tipsy, 
            {
                message: 'data', 
                list: emote_manager.emote_list,
                tipsy: local_settings.use_tipsy,
                maki: local_settings.override_maki,
                case_sensitive: local_settings.case_sensitive,
                dynamic: local_settings.replace_emotes_dynamically
            });
        }
    }
    
    function valid_url(url) {
        var result = true;
        
        if (url.match(address_regex)) {
            result = false;
        } else {
            if (local_settings.site_filter_mode !== "None") {
                for (var index in local_settings.site_filter_list) {
                    var regex = new RegExp(local_settings.site_filter_list[index], "i");

                    if (local_settings.site_filter_mode === "Blacklist") {
                        if (url.match(regex)) {
                            result = false;
                        }
                    } else if (local_settings.site_filter_mode === "Whitelist") {
                        if (url.match(regex)) {
                            result = true;
                            break;
                        }
                    }
                }
            }
        }

        return result;
    };
}

function EmoteManager(success) {
    var self = this;
    var emote_settings;
    var on_load = success;

    this.emote_list = {};
    this.parsers = [];
    
    //terrible way of doing this
    this.ready = false;
    var ready_count = 0;
    
    function ready_check() {
        var result = false;
        var target = (emote_settings.use_twitch_smilies ? self.parsers.length + 1 : self.parsers.length);
        
        ready_count++;
        
        if (ready_count === target) {
            result = true;
            
            on_load();
        }
            
        return result;
    };
    
    this.initialize = function(data, parse_function) {
        self.parsers = [];
        emote_settings = data;
        
        if (emote_settings) {
            var json_parser;
            if (emote_settings.use_global_emotes === true) {
                
                json_parser = {
                    url: 'http://twitchemotes.com/global.json',
                    process: parse_function,
                    on_load: function(json){ parse_global_json(json, self.add_emote); self.ready = ready_check();},
                    parse: function(){
                        if (this.url && this.process && this.on_load) {
                            this.process(this.url, this.on_load);
                        }
                    }
                };
                
                self.parsers.push(json_parser);
            }
            
            if (emote_settings.use_subscriber_emotes === true) {
                json_parser = {
                    url: 'http://twitchemotes.com/subscriber.json',
                    process: parse_function,
                    on_load: function(json){ parse_subscriber_json(json, self.add_emote); self.ready = ready_check();},
                    parse: function(){
                        if (this.url && this.process && this.on_load) {
                            this.process(this.url, this.on_load);
                        }
                    }
                };
                
                self.parsers.push(json_parser);
            }
            
            if (emote_settings.use_betterttv_emotes === true) {
                json_parser = {
                    url: 'http://cdn.betterttv.net/emotes/emotes.json',
                    process: parse_function,
                    on_load: function(json){ parse_betterttv_json(json, self.add_emote); self.ready = ready_check();},
                    parse: function(){
                        if (this.url && this.process && this.on_load) {
                            this.process(this.url, this.on_load);
                        }
                    }
                };
                
                self.parsers.push(json_parser);
            }

            for (var index in self.parsers) {
                self.parsers[index].parse();
            }
            
            if (emote_settings.use_twitch_smilies === true) {
                include_smilies(emote_settings.twitch_smilies_mode, emote_settings.twitch_smilies_monkeys, self.add_emote);
                self.ready = ready_check();
            }
        }
        
    };
    
    this.add_emote = function(emote_name, emote_url, emote_title) {
        if (emote_name !== undefined && emote_url !== undefined) {
            if (self.is_valid_emote(emote_name)) {
                
                if (emote_settings.case_sensitive === false) {
                    emote_name = emote_name.toLowerCase();
                }
                //just build the html here, save time in contentscript.js
                //emote_url = '<img src="' + emote_url + '" title="' + emote_name + '" alt="' + emote_name + '" style="display: inline;">';

                self.emote_list[emote_name] = {url: emote_url, title: emote_title};
            }
        }
    };
    
    this.is_valid_emote = function(emote_name) {
        var result = true;

        if (emote_name.length <= 1) {
            result = false;
        } else {
            if (emote_settings.emote_filter_mode === "Blacklist") {
                if (emote_settings.emote_filter_list.indexOf(emote_name) !== -1) {
                    result = false;
                }
            } else if (emote_settings.emote_filter_mode === "Whitelist") {
                if (emote_settings.emote_filter_list.indexOf(emote_name) === -1) {
                    result = false;
                }
            }
        }

        return result;
    };
}

function Settings(access, success) {
    var self = this;
    var on_load = success;
    var data_access_function = access;
    
    this.data;
    
    this.use_global_emotes;
    this.use_subscriber_emotes;
    this.use_betterttv_emotes;

    this.replace_emotes_dynamically;
    this.case_sensitive;
    
    this.use_tipsy;
    this.override_maki;

    this.use_twitch_smilies;
    this.twitch_smilies_mode;
    this.twitch_smilies_monkeys;

    this.emote_filter_mode;
    this.emote_filter_list = [];

    this.site_filter_mode;
    this.site_filter_list = [];
    
    this.load_data = function() {
        if (data_access_function) {
            //run injected method, self.build_data occurs upon retrieval
            data_access_function(function(data){
                self.build_data(data);
                if (on_load) {
                    on_load(self.data);
                }
            });
        }
    };
    
    this.build_data = function(data) {
        self.data = data;

        self.use_global_emotes = data.use_global_emotes;
        self.use_subscriber_emotes = data.use_subscriber_emotes;
        self.use_betterttv_emotes = data.use_betterttv_emotes;

        self.replace_emotes_dynamically = data.replace_emotes_dynamically;
        self.case_sensitive = data.case_sensitive;
        
        self.use_tipsy = data.use_tipsy;
        self.override_maki = data.override_maki;

        self.use_twitch_smilies = data.use_twitch_smilies;
        self.twitch_smilies_mode = data.twitch_smilies_mode;
        self.twitch_smilies_monkeys = data.twitch_smilies_monkeys;

        self.emote_filter_mode = data.emote_filter_mode;
        self.emote_filter_list = data.emote_filter_list;

        self.site_filter_mode = data.site_filter_mode;
        self.site_filter_list = data.site_filter_list;

        self.emote_filter_list = newline_split(self.emote_filter_list);
        self.site_filter_list = newline_split(self.site_filter_list);
    };
}

function newline_split(string) {
    var result = [];
    
    if (string) {
        result = string.split(newline_regex);
        
        result = result.filter(function(str){
            return str !== '';
        });
    }
    
    return result;
}

function parse_global_json(json, func) {
    func('Kappa', 'http://static-cdn.jtvnw.net/jtv_user_pictures/chansub-global-emoticon-ddc6e3a8732cb50f-25x28.png', 'Kappa');

    for (var parse_emote in json) {
        func(parse_emote, json[parse_emote]['url'], parse_emote);
    }
}

function parse_subscriber_json(json, func) {
    for (var parse_channel in json) {
        for (var parse_emote in json[parse_channel]['emotes']) {
            if (filtered_channels.indexOf(parse_channel.toLowerCase()) === -1) {
                func(parse_emote, json[parse_channel]['emotes'][parse_emote], "Emote: " + parse_emote + "<br>Channel: " + parse_channel);
            }
        }
    }
}

function parse_betterttv_json(json, func) {
    for (var parse_emote in json) {
        //betterttv uses regex
        func(json[parse_emote]['regex'], json[parse_emote]['url'], "Emote: " + parse_emote + "<br>Channel: bttv");
    }
}

function include_smilies(mode, monkeys, func) {
    var smilies;

    if (mode === "Robot") {
        smilies = robot_smilies;
    } else {
        smilies = turbo_smilies;
    }

    for (var index in smilies) {
        func(index, smilies[index], index);
    }

    //monkey support
    if (monkeys) {
        for (var index in monkey_smilies) {
            func(index, monkey_smilies[index], index);
        }
    }

}

//smilies
var robot_smilies = {
    ':)' : 'http://static-cdn.jtvnw.net/jtv_user_pictures/chansub-global-emoticon-ebf60cd72f7aa600-24x18.png',
    ':(' : 'http://static-cdn.jtvnw.net/jtv_user_pictures/chansub-global-emoticon-d570c4b3b8d8fc4d-24x18.png',
    ':o' : 'http://static-cdn.jtvnw.net/jtv_user_pictures/chansub-global-emoticon-ae4e17f5b9624e2f-24x18.png',
    ':z' : 'http://static-cdn.jtvnw.net/jtv_user_pictures/chansub-global-emoticon-b9cbb6884788aa62-24x18.png',
    'B)' : 'http://static-cdn.jtvnw.net/jtv_user_pictures/chansub-global-emoticon-2cde79cfe74c6169-24x18.png',
    ':/' : 'http://static-cdn.jtvnw.net/jtv_user_pictures/chansub-global-emoticon-374120835234cb29-24x18.png',
    ';)' : 'http://static-cdn.jtvnw.net/jtv_user_pictures/chansub-global-emoticon-cfaf6eac72fe4de6-24x18.png',
    ';p' : 'http://static-cdn.jtvnw.net/jtv_user_pictures/chansub-global-emoticon-3407bf911ad2fd4a-24x18.png',
    ':p' : 'http://static-cdn.jtvnw.net/jtv_user_pictures/chansub-global-emoticon-e838e5e34d9f240c-24x18.png',
    'R)' : 'http://static-cdn.jtvnw.net/jtv_user_pictures/chansub-global-emoticon-0536d670860bf733-24x18.png',
    'o_O': 'http://static-cdn.jtvnw.net/jtv_user_pictures/chansub-global-emoticon-8e128fa8dc1de29c-24x18.png',
    ':D' : 'http://static-cdn.jtvnw.net/jtv_user_pictures/chansub-global-emoticon-9f2ac5d4b53913d7-24x18.png',
    '>(' : 'http://static-cdn.jtvnw.net/jtv_user_pictures/chansub-global-emoticon-d31223e81104544a-24x18.png',
    '<3' : 'http://static-cdn.jtvnw.net/jtv_user_pictures/chansub-global-emoticon-577ade91d46d7edc-24x18.png'
};

var turbo_smilies = {
    ':)' : 'http://static-cdn.jtvnw.net/jtv_user_pictures/chansub-global-emoticon-64f279c77d6f621d-21x18.png',
    ':(' : 'http://static-cdn.jtvnw.net/jtv_user_pictures/chansub-global-emoticon-c41c5c6c88f481cd-21x18.png',
    ':o' : 'http://static-cdn.jtvnw.net/jtv_user_pictures/chansub-global-emoticon-a43f189a61cbddbe-21x18.png',
    ':z' : 'http://static-cdn.jtvnw.net/jtv_user_pictures/chansub-global-emoticon-ff8b4b697171a170-21x18.png',
    'B)' : 'http://static-cdn.jtvnw.net/jtv_user_pictures/chansub-global-emoticon-9ad04ce3cf69ffd6-21x18.png',
    ':/' : 'http://static-cdn.jtvnw.net/jtv_user_pictures/chansub-global-emoticon-7cd0191276363a02-21x18.png',
    ';)' : 'http://static-cdn.jtvnw.net/jtv_user_pictures/chansub-global-emoticon-54ab3f91053d8b97-21x18.png',
    ';p' : 'http://static-cdn.jtvnw.net/jtv_user_pictures/chansub-global-emoticon-a66f1856f37d0f48-21x18.png',
    ':p' : 'http://static-cdn.jtvnw.net/jtv_user_pictures/chansub-global-emoticon-a3ceb91b93f5082b-21x18.png',
    'R)' : 'http://static-cdn.jtvnw.net/jtv_user_pictures/chansub-global-emoticon-ffe61c02bd7cd500-21x18.png',
    'o_O': 'http://static-cdn.jtvnw.net/jtv_user_pictures/chansub-global-emoticon-38b510fc1dd50022-21x18.png',
    ':D' : 'http://static-cdn.jtvnw.net/jtv_user_pictures/chansub-global-emoticon-1c8ec529616b79e0-21x18.png',
    '>(' : 'http://static-cdn.jtvnw.net/jtv_user_pictures/chansub-global-emoticon-91a9cf0c00b30760-21x18.png',
    '<3' : 'http://static-cdn.jtvnw.net/jtv_user_pictures/chansub-global-emoticon-934a78aa6d805cd7-21x18.png'
};

var monkey_smilies = {
    '<3' : 'http://static-cdn.jtvnw.net/jtv_user_pictures/chansub-global-emoticon-3f5d7d20df6ee956-20x18.png',
    'R)' : 'http://static-cdn.jtvnw.net/jtv_user_pictures/chansub-global-emoticon-7791c28e2e965fdf-20x22.png',
    ':>' : 'http://static-cdn.jtvnw.net/jtv_user_pictures/chansub-global-emoticon-665aec4773011f44-27x42.png',
    '<]' : 'http://static-cdn.jtvnw.net/jtv_user_pictures/chansub-global-emoticon-fd30ca5440d03927-20x42.png',
    ':7' : 'http://static-cdn.jtvnw.net/jtv_user_pictures/chansub-global-emoticon-206849962fa002dd-29x24.png',
    ':(' : 'http://static-cdn.jtvnw.net/jtv_user_pictures/chansub-global-emoticon-e4acdcf1ff2b4cef-20x18.png',
    ':p' : 'http://static-cdn.jtvnw.net/jtv_user_pictures/chansub-global-emoticon-e7b4f5211a173ff1-20x18.png',
    ';p' : 'http://static-cdn.jtvnw.net/jtv_user_pictures/chansub-global-emoticon-a63a460b5e1f74fc-20x18.png',
    ':o' : 'http://static-cdn.jtvnw.net/jtv_user_pictures/chansub-global-emoticon-30f5d7516b695012-20x18.png',
    ':\\': 'http://static-cdn.jtvnw.net/jtv_user_pictures/chansub-global-emoticon-5067d1fe40f8e607-20x18.png',
    ':|' : 'http://static-cdn.jtvnw.net/jtv_user_pictures/chansub-global-emoticon-d6e8b4f562b8f46f-20x18.png',
    ':s' : 'http://static-cdn.jtvnw.net/jtv_user_pictures/chansub-global-emoticon-f5428b0c125bf4a5-20x18.png',
    ':D' : 'http://static-cdn.jtvnw.net/jtv_user_pictures/chansub-global-emoticon-89679577f86caf4e-20x18.png',
    'o_O': 'http://static-cdn.jtvnw.net/jtv_user_pictures/chansub-global-emoticon-8429b9f83d424cb4-20x18.png',
    '>(' : 'http://static-cdn.jtvnw.net/jtv_user_pictures/chansub-global-emoticon-a6848b1076547d6f-20x18.png',
    ':)' : 'http://static-cdn.jtvnw.net/jtv_user_pictures/chansub-global-emoticon-ae6e77b75597c3d6-20x18.png',
    'B)' : 'http://static-cdn.jtvnw.net/jtv_user_pictures/chansub-global-emoticon-f381447031502180-20x18.png',
    ';)' : 'http://static-cdn.jtvnw.net/jtv_user_pictures/chansub-global-emoticon-095b4874cbf49881-20x18.png',
    '#/' : 'http://static-cdn.jtvnw.net/jtv_user_pictures/chansub-global-emoticon-39f51e122c6b2d60-27x18.png'
};

//weird emotes, filtering them out by default
var filtered_channels = [
    '90stardust',
    'agetv1',
    'beyondthesummit',
    'canadacup',
    'delovely',
    'fahr3nh3it_ftw',
    'fwiz',
    'gomexp_2014_season_two',
    'gsl',
    'gsl_premium',
    'gsl_standard',
    'hoarseborn',
    'ilastpack',
    'jewelxo',
    'lcs_pros_in_koreansoloq',
    'leveluplive',
    'lionheartx10',
    'nadeshot',
    'princesstiagarlow',
    'qfmarine',
    'quinckgaming',
    'smitegame',
    'srkevo1',
    'scyx17',
    'starladder1',
    'thepremierleague',
    'wcs',
    'werster',
    'worldclasslol'
];