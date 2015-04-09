function ContentScript() {
    var self = this;
    this.emote_list = {};
    
    //prevent doublechecking
    this.processed_nodes = [];
    
    this.parse_emotes = function(parent) {
        
        if (parent) {
            var nodes = retrieve_text_nodes_under(parent);

            nodes = nodes.filter(filter_node);

            for (var index in nodes) {
                replace_text(nodes[index]);
            }
        }
        
    };
    
    function retrieve_text_nodes_under(parent) {
        var next_child;
        var all_nodes = [];
        var walk = document.createTreeWalker(parent, NodeFilter.SHOW_TEXT, null, false);

        while (next_child = walk.nextNode()) {
            all_nodes.push(next_child);
        }

        return all_nodes;
    };
    
    function filter_node(current_node) {
        var result = true;
        
        if (current_node) {
            result = result && test_node(current_node.parentElement, 
                    [{type:'equals', value:'chat-line'}, {type:'indexOf', value:'tipsy'}],
                    [{type:'equals', value:'textarea'}, {type:'equals', value:'script'}, {type:'equals', value:'style'}]);
            
            if (current_node.parentElement) {
                result = result && test_node(current_node.parentElement.parentElement,
                [{type:'indexOf', value:'tweet-box'}, {type:'indexOf', value:'rich-normalizer'}, {type:'indexOf', value:'chat-line'}]
                [{}]);
            }
            
        } else {
            result = false;
        }
        

        return result;
    };
    
    //should clean up
    function test_node(node, class_rules, tag_rules) {
        var result = true;
        
        if (node) {
            var node_class = node.className;
            var node_tag = node.tagName;
            
            if (node_class) {
                var name = node_class.toString();
                name = name.toLowerCase();
                
                for (var index in class_rules) {
                    var rule = class_rules[index];
                    if (rule.type === 'indexOf') {
                        if (name.indexOf(rule.value) !== -1) {
                            result = false;
                            break;
                        }
                    } else {
                        if (name === rule.value) {
                            result = false;
                            break;
                        }
                    }
                }
                
                name = node_tag.toString();
                name = name.toLowerCase();
                
                for (var index in tag_rules) {
                    var rule = tag_rules[index];
                    if (rule.type === 'indexOf') {
                        if (name.indexOf(rule.value) !== -1) {
                            result = false;
                            break;
                        }
                    } else {
                        if (name === rule.value) {
                            result = false;
                            break;
                        }
                    }
                }
            }
            
        } else {
            result = false;
        }
        
        return result;
    };
    
    function replace_text(node) {
        var text = node.nodeValue;
        var node_parent = node.parentElement;
        
        var words = text.match(/\S+/g);

        if (words) {
            words.some(function(word) {
                if (self.emote_list.hasOwnProperty(word)) {
                    var index = text.indexOf(word);
                    var previous = text.substring(0, index);
                    var next = text.substring(index + word.length);

                    var prev = document.createTextNode(previous);
                    var emote = document.createElement('span');
                    
                    emote.innerHTML = self.emote_list[word];
                    node.nodeValue = next;
                    
                    self.processed_nodes.push(prev);
                    self.processed_nodes.push(emote);
                    

                    node_parent.insertBefore(prev, node);
                    node_parent.insertBefore(emote, node);

                    if (node.nodeValue === '') {
                        node_parent.removeChild(node);
                    } else {
                        replace_text(node);
                    }
                    return true;
               }
            });
        }
    };
}

