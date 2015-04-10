var content_script = new ContentScript();

var observer = new MutationObserver(function (mutations) {
    mutations.forEach(function(mutation) {
        for (var index = 0; index < mutation.addedNodes.length; ++index) {
            var next_node = mutation.addedNodes.item(index);
            
            if (content_script.processed_nodes.indexOf(next_node) !== -1) {
                content_script.processed_nodes.splice(content_script.processed_nodes.indexOf(next_node), 1);
            } else {
                investigate_body(mutation.addedNodes.item(index));
            }
            
        }
    });
});

chrome.runtime.onMessage.addListener(function(request) {
    
    if (request.message === 'data') {
        content_script.emote_list = request.list;
    
        if (request.dynamic === true) {
            // Make an observer that looks for nodes being created and ignores all other mutations

            // Attach the observer to the node you want to monitor
            observer.observe(document, {childList: true, subtree: true});
        }
        
        investigate_body(document);
    }
    
});

function investigate_body(body) {
    content_script.parse_emotes(body);
}
