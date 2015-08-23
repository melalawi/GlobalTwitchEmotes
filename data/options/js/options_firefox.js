function set_data(data, on_saved) {
	self.port.once("save_confirmed", function(message) {
		on_saved();
	});
	
    self.port.emit("set_data", data);
}

function get_data(on_load) {
	self.port.emit("get_data", "data");
	
	self.port.once("data_received", function(data) {
		on_load(data);
	});
}