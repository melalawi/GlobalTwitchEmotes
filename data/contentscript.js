var MAKI_SRC = 'http://edge.sf.hitbox.tv/static/img/chat/default/maki2.png';

//Regex for separating stuff
var separator = /([\w]|[:;)(\\\/<>73#\|\]])+/g;

function ContentScript() {
    var self = this;
    
    this.use_tipsy = true;
    this.override_maki = false;
    this.case_sensitive = true;
    this.sanitizer;
    this.emote_list = {};
    
    //prevent doublechecking
    this.processed_nodes = [];
    
    this.parse_emotes = function(parent) {
        
        if (parent) {
            var nodes = retrieve_text_nodes_under(parent);

            nodes = nodes.filter(is_valid_node);

            for (var index in nodes) {
                replace_text(nodes[index]);
            }
            
            if (self.override_maki) {
                replace_maki(parent);
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
    
    function replace_text(node) {
        var text = node.nodeValue;
        var node_parent = node.parentElement;
        
        var words = text.match(separator);
        
        var emote_data;
        var comparison;

        if (words) {
            words.some(function(word) {
                comparison = word;
                
                if (self.case_sensitive === false) {
                    comparison = comparison.toLowerCase();
                }
                
                if (self.emote_list.hasOwnProperty(comparison)) {
                    emote_data = get_emote(self.emote_list[comparison]);
                    //need to clean/refactor, ugly to look at atm
                    var title = (self.use_tipsy === true ? emote_data.title : word);
                    
                    var index = text.indexOf(word);
                    var previous = text.substring(0, index);
                    var next = text.substring(index + word.length);

                    var prev = document.createTextNode(previous);
                    
                    emote_data.title = title;

                    node.nodeValue = next;
                    
                    self.processed_nodes.push(prev);
                    self.processed_nodes.push(emote_data);

                    node_parent.insertBefore(prev, node);
                    node_parent.insertBefore(emote_data, node);

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
    
    //beta, will implement ability to only bother with this if on hitbox.tv
    function replace_maki(node) {
        if (node && typeof node.getElementsByTagName === "function") {
            var emotes = node.getElementsByTagName("img");
        
            for (var index in emotes) {
                var maki = emotes[index];
                if (maki.src === MAKI_SRC) {
                    var emote = get_emote(self.emote_list['Kappa']);
                    
                    emote.title = '*Belch*';
                    
                    maki.parentElement.replaceChild(emote, maki);

                }
            }
        }
        
    };
    
    function get_emote(emote_data) {
        
        var emote = document.createElement('div');
        var result;
        
        emote.innerHTML = sanitize_html(emote_data);
        result = emote.firstChild;
        
        if (self.use_tipsy) {
            $(result).tipsy({gravity: 'se', html: true});
        }

        return result;

    }
}

//basic caja sanitizer
function sanitize_html(html) {
    var urlTransformer = function(s) { return s; };
        
    var nameIdClassTransformer = urlTransformer;

    return html_sanitize(html, urlTransformer, nameIdClassTransformer);
}

var rules = {name:'tag', type:'equals', value:'textarea'};

var parent_rules = [
    {name:'class', type:'equals', value:'chat-line'},
    {name:'class', type:'indexOf', value:'tipsy'},
    {name:'class', type:'equals', value:'gsfi'},
    {name:'tag', type:'equals', value:'textarea'},
    {name:'tag', type:'equals', value:'script'},
    {name:'tag', type:'equals', value:'style'}
];
var grandparent_rules = [
    {name:'class', type:'indexOf', value:'tweet-box'},
    {name:'class', type:'indexOf', value:'rich-normalizer'},
    {name:'class', type:'indexOf', value:'chat-line'}
];

//Really don't like how this turned out
//should clean up/rethink
function is_valid_node(node) {
    var result = true;
    
    var parent_node;
    var grandparent_node;

    if (node) {
        parent_node = node.parentElement;
        result = test_rules(node.className, node.tagName, rules);
        
        if (parent_node) {
            grandparent_node = parent_node.parentElement;
            result = result && test_rules(parent_node.className, parent_node.tagName, parent_rules);
            
            if (grandparent_node) {
                result = result && test_rules(grandparent_node.className, grandparent_node.tagName, parent_rules);
            }
        }
        
    } else {
        result = false;
    }

    return result;
};

function test_rules(class_name, tag_name, ruleset) {
    var result = true;
    var test_case;
    
    if (typeof class_name === 'string' && typeof tag_name === 'string') {
        class_name = class_name.toLowerCase();
        tag_name = tag_name.toLowerCase();
        
        for (var index in ruleset) {
            var rule = ruleset[index];
            test_case = (rule.name === 'class' ? class_name : tag_name);
            
            if (rule.type === 'indexOf') {
                if (test_case.indexOf(rule.value) !== -1) {
                    result = false;
                    break;
                }
            } else if (rule.type === 'equals') {
                if (test_case === rule.value) {
                    result = false;
                    break;
                }
            }
        }
    }
    
    return result;
};