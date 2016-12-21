'use strict';
var PAGE_OBSERVER_PARAMETERS = {
    attributes: false,
    characterData: true,
    childList: true,
    subtree: true
};
var ILLEGAL_TAGNAMES = [
    'IMG', 'SCRIPT', 'TEXTAREA'
];
var mutationObserver;
var nodeCallback;
var mutatedNodes = [];
var currentlyInvestigating = false;


function observePage(callback) {
    nodeCallback = callback;
    mutationObserver = new MutationObserver(onPageChange);

    mutationObserver.observe(document.body, PAGE_OBSERVER_PARAMETERS);
    mutatedNodes.push(document.body);

    setTimeout(iterateThroughNodes, 1);
}

function onPageChange(changes) {
    for (var i = 0; i < changes.length; ++i) {
        var pageChange = changes[i];

        if (pageChange.type === 'characterData') {
            addMutatedNode(pageChange.target);
        } else if (pageChange.type === 'childList') {
            for (var index = 0; index < pageChange.addedNodes.length; ++index) {
                addMutatedNode(pageChange.addedNodes.item(index));
            }
        }
    }

    setTimeout(iterateThroughNodes, 1);
}

function addMutatedNode(node) {
    if (isIllegalNode(node) === false) {
        mutatedNodes.push(node);
    }
}

//TODO slow on google images
function iterateThroughNodes() {
    if (currentlyInvestigating === false) {
        currentlyInvestigating = true;
        while (mutatedNodes.length > 0) {
            var nextNode = mutatedNodes.pop();

            if (nextNode.nodeType === Node.TEXT_NODE) {
                nodeCallback(nextNode);
            } else if (nextNode.nodeType === Node.ELEMENT_NODE) {
                var treeWalker = document.createTreeWalker(nextNode, NodeFilter.SHOW_TEXT, null, false);
                var treeChild;

                while (treeChild = treeWalker.nextNode()) {
                    if (isIllegalNode(treeChild) === false) {
                        mutatedNodes.push(treeChild);
                    }
                }
            }
        }
        currentlyInvestigating = false;
    }
}

function isIllegalNode(n) {
    var isIllegal = false;
    var node = n.nodeType === Node.TEXT_NODE ? n.parentNode : n;

    if (!node) {
        isIllegal = false;
    } else if (ILLEGAL_TAGNAMES.indexOf(node.tagName) !== -1) {
        isIllegal = true;
    } else if (node.isContentEditable) {
        isIllegal = true;
    } else if (n.nodeType === Node.TEXT_NODE && n.nodeValue.replace(/\s/g, '').length < 2) {
        // Textnodes with little to no text can be disregarded
        isIllegal = true;
    } else if (n.className && n.className.indexOf('GTETipsy') !== -1) {
        isIllegal = true;
    }

    return isIllegal;
}

module.exports = {
    observe: observePage
};