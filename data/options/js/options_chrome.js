//chrome doesn't have a way to inject script into options pages only (that i'm aware of), so I have to use the old fashioned html <script> tags
//the if statements check if chrome exist and prevent firefox from getting upset
function get_data(on_load) {
	if (typeof chrome === 'object') {
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

			emote_filter_mode: 'None',
			emote_filter_list: "",

			site_filter_mode: 'None',
			site_filter_list: ""
		}, function(settings) {
			on_load(settings);
		});
	}
}

function set_data(data, on_saved) {
	if (typeof chrome === 'object') {
		if (data) {
			chrome.storage.local.set({
				use_global_emotes: data.use_global_emotes,
				use_subscriber_emotes: data.use_subscriber_emotes, 
				use_betterttv_emotes: data.use_betterttv_emotes,

				replace_emotes_dynamically: data.replace_emotes_dynamically,
				case_sensitive: data.case_sensitive,
				use_tipsy: data.use_tipsy,
				override_maki: data.override_maki,

				use_twitch_smilies: data.use_twitch_smilies,
				twitch_smilies_mode: data.twitch_smilies_mode,
				twitch_smilies_monkeys: data.twitch_smilies_monkeys,

				emote_filter_mode: data.emote_filter_mode,
				emote_filter_list: data.emote_filter_list,

				site_filter_mode: data.site_filter_mode,
				site_filter_list: data.site_filter_list
			}, function() {
				on_saved();
			});
		}
	}

}