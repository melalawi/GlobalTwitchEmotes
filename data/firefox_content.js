var content_script = new ContentScript();

var observer = new MutationObserver(function (mutations) {
    mutations.forEach(function(mutation) {
        for (var index = 0; index < mutation.addedNodes.length; ++index) {
            var next_node = mutation.addedNodes.item(index);
            
            if (content_script.processed_nodes.indexOf(next_node) !== -1) {
                content_script.processed_nodes.splice(content_script.processed_nodes.indexOf(next_node), 1);
            } else {
                console.log("new");
                investigate_body(mutation.addedNodes.item(index));
            }
            
        }
    });
});

self.port.once('data', function(data){
    
    if (data.message === 'data') {
        content_script.emote_list = data.list;
        
        if (data.dynamic === true) {
            observer.observe(document, {childList: true, subtree: true});
        }
        
        investigate_body(document);
    }
    
});

function investigate_body(body) {
    content_script.parse_emotes(body);
}
