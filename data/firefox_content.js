var content_script = new ContentScript();

self.port.once('data', function(data){
    content_script.emote_list = data.list;
    
    if (data.dynamic === true) {
        document.addEventListener('DOMNodeInserted', function(event){
            investigate_body(event.target);
        }, false);
    }

    investigate_body(document);
});

function investigate_body(body) {
    content_script.parse_emotes(body);
}