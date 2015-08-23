var GTE_SCRIPT = (function () {

"use strict";

const GTE_NODE = 'data-gtenode',
      GTE_CHANNEL = 'gtechannel';
const HITBOX_KAPPA = 'http://edge.sf.hitbox.tv/static/img/chat/default/maki2.png';
    
const STRING_SEPARATOR = /([\w]|[:;)(\\\/<>73#\|\]])+/g;

const ILLEGAL_NODES = [
    [
        {attrFunc: 'hasClass', attrName: 'message', attrEqual: true},
        {attrFunc: 'data', attrName: 'raw', attrNotEqual: undefined},
        {attrFunc: 'data', attrName: 'emotes', attrNotEqual: undefined}
    ],
    [{attrFunc: 'hasClass', attrName: 'GTETipsy', attrEqual: true}],
    [{attrFunc: 'hasClass', attrName: 'tweet-box', attrEqual: true}],
    [{attrFunc: 'hasClass', attrName: 'tipsy', attrEqual: true}],
    [{attrFunc: 'prop', attrName: 'tagName', attrEqual: 'TEXTAREA'}]
];

function ContentScript() {
    var observer,
        settingsData = null;

    this.initialize = function(settings) {
        if (settingsData === null) {
            settingsData = settings;

            //check whole page
            investigateNode(document.body);

            if (settingsData.settings.enableDynamicEmotification) {
                initializeObserver();
            }
        }
    };

    function initializeObserver() {
        var observer = new MutationObserver(function (changes) {
            changes.forEach(function(currentChange) {
                if (currentChange.type === 'characterData') {
                    investigateNode(currentChange.target);
                } else if (currentChange.type === 'childList') {
                    for (var index = 0; index < currentChange.addedNodes.length; ++index) {
                        var currentNode = currentChange.addedNodes.item(index);

                        investigateNode(currentNode);

                        //hitbox kappa check
                        if (currentNode.baseURI && currentNode.baseURI.match('hitbox.tv')) {
                            processImages(currentNode);
                        }
                    }
                }
            });


        });

        observer.observe(document.body, {childList: true, subtree: true, characterData: true});
    }

    function investigateNode(node) {
        if (node) {
            if (!getNodeAttribute(node, 'data-gtenode')) {
                if (node.nodeType === Node.TEXT_NODE) {
                    checkTextNode(node);
                } else {
                    processTextChildren(node);
                }
            }
        }
    }

    /*
    function processTextChildren(base) {
        if (base) {
            var children = [],
                nextChild,
                walker = document.createTreeWalker(base, NodeFilter.SHOW_ALL, filterTextAndImages, false);

            while (nextChild = walker.nextNode()) {
                children.push(nextChild);
            }

            for (var index = 0; index < children.length; ++index) {
                if (children[index].tagName === 'IMG') {
                    if (settingsData.settings.enableHitboxKappa) {
                        processImage(children[index]);
                    }
                } else {
                    checkTextNode(children[index]);
                }
            }
        }
    }*/

    function processTextChildren(base) {
        if (base) {
            var children = [],
                nextChild,
                walker = document.createTreeWalker(base, NodeFilter.SHOW_TEXT, null, false);

            while (nextChild = walker.nextNode()) {
                if (nextChild.nodeValue.replace(/\s/g, '').length > 1) {
                    children.push(nextChild);
                }
            }

            for (var index = 0; index < children.length; ++index) {
                checkTextNode(children[index]);
            }
        }
    }

    function checkTextNode(base) {
        if (base) {
            var textContent = base.nodeValue;

            //simple validity check: parents must be of legal types
            //and textcontent must contain meaningful data
            if (legallyContained(base) && textContent.replace(/\s/g, '').length > 1) {
                setLoop: for (var setIndex in settingsData.emotes) {

                    if (settingsData.emotes.hasOwnProperty(setIndex)) {
                        var currentSet = settingsData.emotes[setIndex],
                            nextWord;

                        while ((nextWord = STRING_SEPARATOR.exec(textContent)) !== null) {
                           if (currentSet.hasOwnProperty(nextWord[0])) {
                               var indexEnd = STRING_SEPARATOR.lastIndex;

                               //reset the regex BEFORE continuing in order to make sure other nodes are checked properly
                               STRING_SEPARATOR.lastIndex = 0;

                               emotifyNode(base, nextWord.index, indexEnd, currentSet[nextWord[0]]);

                               //reset text content as it has changed
                               textContent = base.nodeValue;
                               break setLoop;
                           }
                        }
                    }
                }
                
                //done with this node, leave it open for further checking in the future
                setNodeAttribute(base, GTE_NODE, false);
            }
        }
    }

    function emotifyNode(baseNode, indexStart, indexEnd, emote) {
        if (baseNode) {
            var parent = baseNode.parentNode,
                nodeText = baseNode.nodeValue,
                emoteNode = generateEmote(emote),
                googleSearchNode = $(baseNode).closest('cite._Rm'),//bad
                nextNode;

            parent.insertBefore(emoteNode, baseNode.nextSibling);

            //fix for chrome url results being squished
            //bad
            if (googleSearchNode.length) {
                googleSearchNode.parent().css('height', 'auto');
            }

            //check for text after the new emote
            if (indexEnd < nodeText.length) {
                nextNode = document.createTextNode(nodeText.substring(indexEnd));

                setNodeAttribute(nextNode, GTE_NODE, true);
                parent.insertBefore(nextNode, emoteNode.nextSibling);
            }

            //no text before the new emote, so remove the textnode
            if (indexStart === 0) {
                parent.removeChild(baseNode);
            } else {
                //otherwise, crop and check again
                setNodeAttribute(baseNode, GTE_NODE, true);
                baseNode.nodeValue = nodeText.substring(0, indexStart);
            }

            //recursively check if the following text nodes are still valid
            if (nextNode) { checkTextNode(nextNode); }

            //check parent, as this node would be considered 'invalid' if it was removed from the DOM (node itself might not have been collected by garbage yet)
            if (baseNode.parentNode) { checkTextNode(baseNode); }
        }
    }

    function generateEmote(emoteHTML) {
        var emote = $('<' + emoteHTML + '>');

        if (settingsData.settings.enableTipsyMode) {
            if (emote.data(GTE_CHANNEL)) {
                emote.attr('title', "Emote: " + emote.attr('title') + "<br>Channel: " + emote.data(GTE_CHANNEL));
            }

            emote.GTETipsy({gravity: 'se', html: true});
        }

        return emote.get(0);
    }

    function processImages(node) {
        $(node).find('img[src="' + HITBOX_KAPPA + '"]').each(function(){
            var emote = generateEmote(settingsData.emotes.TE['Kappa']);

            emote.title = '*Belch*';

            this.parentNode.replaceChild(emote, this);
        });
    }
}

function getNodeAttribute(node, attributeName) {
    var result = null;

    if (node) {
        result = typeof node.getAttribute === "function" ? node.getAttribute(attributeName) : node[attributeName];
    }

    return result;
}

function setNodeAttribute(node, attributeName, attributeValue) {
    if (node) {
        typeof node.setAttribute === "function" ? node.setAttribute(attributeName, attributeValue) : node[attributeName] = attributeValue;
    }
}

//traverses up from provided node to document root, checking to make sure that none of the nodes are 'illegal' as specified by the ILLEGAL_NODES const
function legallyContained(node) {
    var result = true,
        parents = $(node).parents().addBack();//include itself as well for checking

    parentLoop: for (var i = parents.length - 1; i >= 0; --i) {
        var nextParent = $(parents[i]);

        for (var j = 0; j < ILLEGAL_NODES.length; ++j) {
            var testSet = ILLEGAL_NODES[j],
                setResult = true;

            for (var k = 0; k < testSet.length; ++k) {
                var currTest = testSet[k],
                    testValue = nextParent[currTest.attrFunc](currTest.attrName);

                if (currTest.hasOwnProperty('attrEqual')) {
                    setResult = testValue === currTest.attrEqual;
                } else {
                    setResult = testValue !== currTest.attrNotEqual;
                }

                if (setResult === false) {
                    break;
                }
            }

            //illegal according to set, return false
            if (setResult === true) {
                result = false;
                break parentLoop;
            }
        }
    }

    return result;
}


return {
    ContentScript: ContentScript
};

//module namespace
}());