$(document).ready(function() {
	load_site_settings();
	
	$("#saveSettings").click(function(){
		save_site_settings();
	});
	
	$("input[name=sitefilter-type]:radio").change(function () {
		update_textarea_state();
    })
});

function update_textarea_state() {
	if ($('input[name=sitefilter-type]:checked').val() === "None") {
		$("#sitefilter-list").attr("disabled", "disabled"); 
	} else {
		$("#sitefilter-list").removeAttr("disabled"); 
	}
}

function save_site_settings() {
	var site_filter_setting = $('input:radio[name=sitefilter-type]:checked').val();
	var site_filter_area = $("#sitefilter-list").val();
	
    chrome.storage.sync.set({
		site_filter_mode: site_filter_setting,
		site_filter_list: site_filter_area,
    }, function() {
		alert("Saved successfully.");
    });
}

function load_site_settings() {
	
	chrome.storage.sync.get({
		site_filter_mode: 'None',
		site_filter_list: "",
	}, function(settings) {		
		$('input[name=sitefilter-type][value="' + settings.site_filter_mode + '"]').prop('checked', true);
		$("#sitefilter-list").val(settings.site_filter_list);
		
		update_textarea_state();
  });
}