var background = require("firefox_background"),
    simple_prefs = require("sdk/simple-prefs"),
    simple_storage = require("sdk/simple-storage"),
    pageMod = require("sdk/page-mod");

background.initialize();

var contentScriptOptions = {"parentDirectory" : require("sdk/self").data.url(''), versionNumber: require("sdk/self").version};

pageMod.PageMod({
    include: "http://www.ultimate-guitar.com/forum/*",
    contentScriptWhen: "start",
    contentStyleFile: ['./css/ug_changes.css', './css/spectrum.css'],
    contentScriptFile: ["./jquery-2.1.4.min.js", "./jquery.plugins.js", "./spectrum.js", "./uuge.js", "./content.js", "./editor.js", "./page_manager.js", "./page_script.js", "./firefox_adaptor.js"],
    contentScriptOptions: contentScriptOptions,//send content scripts parent path needed to locate local data
    onAttach: listen
});

function listen(worker) {
    worker.port.on('message', function(data) {
        background.manageMessage(data, worker);
    });
}

//options
simple_prefs.on("accessSettings", function() {
    require("sdk/tabs").open({
        url: require("sdk/self").data.url("./options/options_firefox.html"),
        onReady: function(worker) {
            var dataTransfer = worker.attach({
                contentScriptFile: [
                    "./jquery-2.1.4.min.js",
                    "./spectrum.js",
                    "./options/js/options.js",
                    "./options/js/options_firefox.js"],
                contentScriptOptions: contentScriptOptions
            });

            dataTransfer.port.on("message", function(data){
                background.manageMessage(data, dataTransfer);
            });
        }
    });
});

