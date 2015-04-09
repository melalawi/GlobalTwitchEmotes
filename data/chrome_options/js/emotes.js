$(document).ready(function() {
	load_emote_settings();
	
	$("#saveSettings").click(function(){
		save_emote_settings();
	});
	
	$("input[name=emotefilter-type]:radio").change(function () {
		update_textarea_state();
    })
});

function update_textarea_state() {
	if ($('input[name=emotefilter-type]:checked').val() === "None") {
		$("#emotefilter-list").attr("disabled", "disabled"); 
	} else {
		$("#emotefilter-list").removeAttr("disabled"); 
	}
}

function save_emote_settings() {
	var emote_filter_setting = $('input:radio[name=emotefilter-type]:checked').val();
	var emote_filter_area = $("#emotefilter-list").val();
	
    chrome.storage.sync.set({
		emote_filter_mode: emote_filter_setting,
		emote_filter_list: emote_filter_area,
    }, function() {
		alert("Saved successfully.");
    });
}

function load_emote_settings() {
	
	chrome.storage.sync.get({
		emote_filter_mode: 'None',
		emote_filter_list: "",
	}, function(settings) {
		$('input[name=emotefilter-type][value="' + settings.emote_filter_mode + '"]').prop('checked', true);
		$("#emotefilter-list").val(settings.emote_filter_list);
		
		update_textarea_state();
  });
}