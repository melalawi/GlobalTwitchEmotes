var general_div;
var emotes_div;
var sites_div;
var about_div;

$(document).ready(function() {
	
    initialize();
    load_settings();

    $("#settingsbutton").click(function(){
        change_page('general');
    });

    $("#emotesbutton").click(function(){
        change_page('emotes');
    });

    $("#sitesbutton").click(function(){
        change_page('sites');
    });

    $("#aboutbutton").click(function(){
        change_page('about');
    });
});

function initialize() {
    reset_buttons('#settingsbutton');

    general_div = create_page('general');
    emotes_div = create_page('emotes');
    sites_div = create_page('sites');
    about_div = create_page('about');

    change_page('general');
}

//turns redundant options off appropriately
function update_selectables() {
    var smiley_box = $(general_div).find('#enableSmilies')[0];
    var monkey_box = $(general_div).find('#enableMonkeys')[0];
    var smiley_radio = $(general_div).find('input[name="smilies-radio"]');
    
    var emotes_textarea = $(emotes_div).find('#emotefilter-list')[0];
    
    var sites_textarea = $(sites_div).find('#sitefilter-list')[0];
    
    if ($(smiley_box).is(':checked')) {
        $(smiley_radio).removeAttr("disabled");
        monkey_box.disabled = false;
    } else {
        $(smiley_radio).attr("disabled", "disabled");
        monkey_box.disabled = true;
    }
    
    if ($(emotes_div).find('input[name="emote-radio"][value="None"]').prop('checked') === true) {
        $(emotes_textarea).attr("disabled", "disabled"); 
    } else {
        $(emotes_textarea).removeAttr("disabled");
    }
    
    if ($(sites_div).find('input[name="site-radio"][value="None"]').prop('checked') === true) {
        $(sites_textarea).attr("disabled", "disabled"); 
    } else {
        $(sites_textarea).removeAttr("disabled");
    }
}

function load_settings() {
    get_data(function(data) {
        if (data) {
            $(general_div).find("#enableGlobal")[0].checked = data.use_global_emotes;
            $(general_div).find('#enableSubscriber')[0].checked = data.use_subscriber_emotes;
            $(general_div).find('#enableBetterTTV')[0].checked = data.use_betterttv_emotes;
            $(general_div).find('#enableDynamic')[0].checked = data.replace_emotes_dynamically;
            $(general_div).find('#enableCaseSensitive')[0].checked = data.case_sensitive;
            $(general_div).find('#enableTipsy')[0].checked = data.use_tipsy;
            $(general_div).find('#enableMaki')[0].checked = data.override_maki;
            $(general_div).find('#enableSmilies')[0].checked = data.use_twitch_smilies;
            $(general_div).find('input[name="smilies-radio"][value="' + data.twitch_smilies_mode + '"]').prop('checked', true);
            $(general_div).find('#enableMonkeys')[0].checked = data.twitch_smilies_monkeys;			

            $(emotes_div).find('input[name="emote-radio"][value="' + data.emote_filter_mode + '"]').prop('checked', true);
            $(emotes_div).find('#emotefilter-list')[0].value = data.emote_filter_list;

            $(sites_div).find('input[name="site-radio"][value="' + data.site_filter_mode + '"]').prop('checked', true);
            $(sites_div).find('#sitefilter-list')[0].value = data.site_filter_list;		
        }
        
        update_selectables();
    });
}

function save_settings() {
    set_data({
        use_global_emotes: $(general_div).find("#enableGlobal")[0].checked,
        use_subscriber_emotes: $(general_div).find('#enableSubscriber')[0].checked,
        use_betterttv_emotes: $(general_div).find('#enableBetterTTV')[0].checked,
        replace_emotes_dynamically: $(general_div).find('#enableDynamic')[0].checked,
        case_sensitive: $(general_div).find('#enableCaseSensitive')[0].checked,
        use_tipsy: $(general_div).find('#enableTipsy')[0].checked,
        override_maki: $(general_div).find('#enableMaki')[0].checked,
        use_twitch_smilies: $(general_div).find('#enableSmilies')[0].checked,
        twitch_smilies_mode: $(general_div).find('input[name="smilies-radio"]:checked').val(),
        twitch_smilies_monkeys: $(general_div).find('#enableMonkeys')[0].checked,

        emote_filter_mode: $(emotes_div).find('input[name="emote-radio"]:checked').val(),
        emote_filter_list: $(emotes_div).find('#emotefilter-list')[0].value,

        site_filter_mode: $(sites_div).find('input[name="site-radio"]:checked').val(),
        site_filter_list: $(sites_div).find('#sitefilter-list')[0].value
    }, function() {
        alert("Saved successfully.");
    });
}

//should be overridden by chrome/firefox
function get_data(on_load) {
    return undefined;
}

//should be overridden by chrome/firefox
function set_data(data, on_load) {
}

function change_page(page_name) {
    reset_buttons();

    switch(page_name) {
        case 'general':
            var smiley_box = $(general_div).find('#enableSmilies')[0];
            var monkey_box = $(general_div).find('#enableMonkeys')[0];
            var smiley_radio = $(general_div).find('input[name="smilies-radio"]');
    
            reset_buttons('#settingsbutton');
            $('#page.body').replaceWith(general_div);
            
            //general
            $(smiley_box).change(function() {
                if (this.checked) {
                    $(smiley_radio).removeAttr("disabled");
                    monkey_box.disabled = false;
                } else {
                    $(smiley_radio).attr("disabled", "disabled");
                    monkey_box.disabled = true;
                }
            });
        break;
        case 'emotes':
            reset_buttons('#emotesbutton');
            $('#page.body').replaceWith(emotes_div);
            
            var emotes_radio = $(emotes_div).find('input[name="emote-radio"]');
            var emotes_textarea = $(emotes_div).find('#emotefilter-list')[0];
    
            //emotes
            $(emotes_radio).change(function() {
                if ($(emotes_div).find('input[name="emote-radio"][value="None"]').prop('checked') === true) {
                    $(emotes_textarea).attr("disabled", "disabled"); 
                } else {
                    $(emotes_textarea).removeAttr("disabled");
                }
            });
        break;
        case 'sites':
            var sites_radio = $(sites_div).find('input[name="site-radio"]');
            var sites_textarea = $(sites_div).find('#sitefilter-list')[0];
    
            reset_buttons('#sitesbutton');
            $('#page.body').replaceWith(sites_div);
            
            //about
            $(sites_radio).change(function() {
                if ($(sites_div).find('input[name="site-radio"][value="None"]').prop('checked') === true) {
                    $(sites_textarea).attr("disabled", "disabled"); 
                } else {
                    $(sites_textarea).removeAttr("disabled");
                }
            });
        break;
        case 'about':
            reset_buttons('#aboutbutton');
            $('#page.body').replaceWith(about_div);
        break;
        default:
    }
    
    $("#saveSettings").click(function(){
        save_settings();
    });
}

function reset_buttons(id) {
    $('#settingsbutton').removeClass('button-active').addClass('button');
    $('#emotesbutton').removeClass('button-active').addClass('button');
    $('#sitesbutton').removeClass('button-active').addClass('button');
    $('#aboutbutton').removeClass('button-active').addClass('button');

    $(id).removeClass('button').addClass('button-active');
}

function create_page(page_name) {
	
    var result = document.createElement('div');
    $(result).attr('class', 'body');
    $(result).attr('id', 'page');

    $(result).empty();

    switch(page_name) {
        case 'general':
            $(result).html(general_html);
        break;
        case 'emotes':
            $(result).html(emotes_html);
        break;
        case 'sites':
            $(result).html(sites_html);
        break;
        case 'about':
            $(result).html(about_html);
        break;
        default:
            $(result).html(error_html);
        break;
    }

    return result;
}

var general_html = [
'<br>',
'Use Twitch.tv emote sets:<br>',
'					<UL><input type="checkbox"	id="enableGlobal">Global Emotes<br>',
'					<input type="checkbox"	id="enableSubscriber">Subscriber Emotes<br>',
'					<input type="checkbox"	id="enableBetterTTV">BetterTTV Emotes<br><br></UL>',
'					<input type="checkbox"	id="enableSmilies">Use Twitch.tv smilies<br>',
'					<UL><form id="smilies-type" action="">',
'						<input type="radio" name="smilies-radio" value="Robot">Robot',
'						<input type="radio" name="smilies-radio" value="Turbo">Turbo',
'						<input type="checkbox" id="enableMonkeys">+ Monkeys',
'					</form><br></UL>',
'					<input type="checkbox"	id="enableDynamic">Replace emotes dynamically<br>',
'					<input type="checkbox"	id="enableCaseSensitive">Case-sensitive matching [HIGHLY Recommended] <br>',
'					<input type="checkbox"	id="enableTipsy">Enable Twitch-style emote hovering<br>',
'					<input type="checkbox"	id="enableMaki">Override Hitbox.tv Kappa with GreyFace [BETA]<br><br><br>',
'					<input type="button" 	id="saveSettings"	value="Save">'
].join('');

var emotes_html = [
'<br>',
'Filtering mode:<br>',
'					<UL><form id="emotefilter-type" action="">',
'						<input type="radio" name="emote-radio" value="None">None',
'						<input type="radio" name="emote-radio" value="Blacklist">Blacklist',
'						<input type="radio" name="emote-radio" value="Whitelist">Whitelist<br>',
'					</form></UL>',
'					Emotes to filter (one emote per line):<br><br>',
'					<textarea cols="30" rows="5" id="emotefilter-list"></textarea><br><br><br>					',
'					<input type="button" id="saveSettings" value="Save">'
].join('');

var sites_html = [
'<br>',
'Filtering mode:<br>',
'					<UL><form id="sitefilter-type" action="">',
'						<input type="radio" name="site-radio" value="None">None',
'						<input type="radio" name="site-radio" value="Blacklist">Blacklist',
'						<input type="radio" name="site-radio" value="Whitelist">Whitelist<br>',
'					</form></UL>',
'					Sites to filter (one url per line):<br><br>',
'					<textarea cols="30" rows="5" id="sitefilter-list"></textarea><br><br><br>					',
'					<input type="button" id="saveSettings" value="Save">'
].join('');

var about_html = [
'<h1>Global Twitch Emotes</h1><UL><h2>By Mohamed El-Alawi</h2></UL>',
'<p style="text-indent: 2em;">Hi there! My name\'s Mohamed El-Alawi and I\'m currently an undergraduate student majoring in computer science. I\'ve been passionate about all things programming for my entire life, and while I\'ve started and finished countless little personal projects, most were just that: personal, private, and unshared. I loved to tinker with little bits of code on my own, but I had yet to actually release anything. I won\'t lie, the thought of doing so did scare me at first.</p>',
'<p style="text-indent: 2em;">Eventually, I realized that working solely in clandestine was inhibiting my own growth as a programmer, and the only way I could truly improve my skills was to throw my creations out there, to be judged by users such as yourself. ',
'I\'ve been a huge fan of Twitch.tv ever since its debut in 2011, and I figured that my first \'official\' software release should target the community I love. So here it is, Global Twitch Emotes. I sincerely hope you enjoy it.</p>',
'I would <i>love</i> to hear what you have to say:<br><br>',
'<a href="mailto:elalawi_mohamed@yahoo.ca?Subject=GTE Feedback:" target="_blank"><img src="images/email.png"/><br>',
'<a href="https://twitter.com/m_elalawi" target="_blank"><img src="images/tweet.png"/></a><br><br>',
'<form action="https://www.paypal.com/cgi-bin/webscr" method="post" target="_top">',
'<input type="hidden" name="cmd" value="_s-xclick">',
'<input type="hidden" name="encrypted" value="-----BEGIN PKCS7-----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-----END PKCS7-----">',
'<input type="image" title="Support me via Paypal" alt="Support me via Paypal" src="images/support.png" border="0" name="submit">',
'<img alt="" border="0" src="https://www.paypalobjects.com/en_US/i/scr/pixel.gif" width="1" height="1">',
'</form><br>'
].join('');

var error_html = 'Page not found';