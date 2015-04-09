$(document).ready(function() {
	load_general_settings();
	
	$("#saveSettings").click(function(){
		save_general_settings();
	});
	
	$("#enableSmilies").change(function(){
		update_radiobuttons_state();
	});
});

function update_radiobuttons_state() {
	if($("#enableSmilies").is(':checked')) {
		$('input[name=smilies-type]').removeAttr("disabled");
		document.getElementById('enableMonkeys').disabled = false;
	} else {
		$('input[name=smilies-type]').attr("disabled", "disabled");
		document.getElementById('enableMonkeys').disabled = true;
	}
}

function save_general_settings() {
	var global_emotes = document.getElementById('enableGlobal');
	var subscriber_emotes = document.getElementById('enableSubscriber');
	var betterttv_emotes = document.getElementById('enableBetterTTV');
	var replace_dynamic = document.getElementById('enableDynamic');
	var twitch_smilies_enable = document.getElementById('enableSmilies');
	var twitch_smilies_state = $('input:radio[name=smilies-type]:checked').val();
	var twitch_use_monkeys = document.getElementById('enableMonkeys');

    chrome.storage.sync.set({
        use_global_emotes: global_emotes.checked,
        use_subscriber_emotes: subscriber_emotes.checked,
        use_betterttv_emotes: betterttv_emotes.checked,
		replace_emotes_dynamically: replace_dynamic.checked,
		use_twitch_smilies: twitch_smilies_enable.checked,
		twitch_smilies_mode: twitch_smilies_state,
		twitch_smilies_monkeys: twitch_use_monkeys.checked,
    }, function() {
		alert("Saved successfully.");
    });
}

function load_general_settings() {
	chrome.storage.sync.get({
		use_global_emotes: true,
        use_subscriber_emotes: true,
        use_betterttv_emotes: false,
		replace_emotes_dynamically: true,
		use_twitch_smilies: false,
		twitch_smilies_mode: 'Robot',
		twitch_smilies_monkeys: false,
	}, function(settings) {
		document.getElementById('enableGlobal').checked = settings.use_global_emotes;
		document.getElementById('enableSubscriber').checked = settings.use_subscriber_emotes;
		document.getElementById('enableBetterTTV').checked = settings.use_betterttv_emotes;
		document.getElementById('enableDynamic').checked = settings.replace_emotes_dynamically;
		document.getElementById('enableSmilies').checked = settings.use_twitch_smilies;
		$('input[name=smilies-type][value="' + settings.twitch_smilies_mode + '"]').prop('checked', true);
		document.getElementById('enableMonkeys').checked = settings.twitch_smilies_monkeys;
		
		update_radiobuttons_state();
  });
}