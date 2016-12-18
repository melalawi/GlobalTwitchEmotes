'use strict';
var PAGE_OBSERVER_PARAMETERS = {
    attributes: false,
    childList: true,
    subtree: false,
    characterData: true
};
var ILLEGAL_TAGNAMES = [
    'IMG', 'SCRIPT', 'TEXTAREA'
];
var mutationObserver;
var nodeCallback;


function observePage(callback) {
    nodeCallback = callback;
    mutationObserver = new MutationObserver(onPageChange);

    mutationObserver.observe(document.body, PAGE_OBSERVER_PARAMETERS);
    iterateThroughNodes(document.body);
}

function onPageChange(changes) {
    changes.forEach(function(currentChange) {
        if (currentChange.type === 'characterData') {
            iterateThroughNodes(currentChange.target);
        } else if (currentChange.type === 'childList') {
            for (var index = 0; index < currentChange.addedNodes.length; ++index) {
                var currentNode = currentChange.addedNodes.item(index);

                iterateThroughNodes(currentNode);
            }
        }
    });
}

//TODO slow on google images
function iterateThroughNodes(node) {
    var stack = [node];

    if (isIllegalNode(node)) {
        return;
    }

    while (stack.length > 0) {
        var nextNode = stack.pop();

        if (nextNode.nodeType === Node.TEXT_NODE) {
            nodeCallback(nextNode);
        } else if (nextNode.nodeType === Node.ELEMENT_NODE) {
            var treeWalker = document.createTreeWalker(nextNode, NodeFilter.SHOW_TEXT, null, false);
            var treeChild;

            while (treeChild = treeWalker.nextNode()) {
                if (isIllegalNode(treeChild) === false) {
                    stack.push(treeChild);
                }
            }
        }
    }
}

function isIllegalNode(n) {
    var isIllegal = false;
    var node = n.nodeType === Node.TEXT_NODE ? n.parentNode : n;

    if (ILLEGAL_TAGNAMES.indexOf(node.tagName) !== -1) {
        isIllegal = true;
    } else if (node.isContentEditable) {
        isIllegal = true;
    } else if (n.nodeType === Node.TEXT_NODE && n.nodeValue.replace(/\s/g, '').length < 2) {
        // Textnodes with little to no text can be disregarded
        isIllegal = true;
    }

    return isIllegal;
}

module.exports = {
    observe: observePage
};