const PAGE_OBSERVER_PARAMETERS = {
    attributes: false,
    characterData: true,
    childList: true,
    subtree: true
};
const TREE_WALKER_FILTER = {
    acceptNode: treeWalkerFilterFunction
};
const ILLEGAL_TAGNAMES = [
    'IMG', 'NOSCRIPT', 'SCRIPT', 'STYLE', 'TEXTAREA'
];
const MAX_NODES_PER_ITERATION = 100;

var mutatedNodes = [];
var mutationObserver;
var nodeCallback;
var iframeFoundCallback;
var imageFoundCallback;

var pendingImages = [];
var iframeFound = false;
var currentlyIteratingThroughNodes = false;
var iterateNodesCallback;


function startMutationObserver(callback) {
    mutationObserver = new MutationObserver(onPageChange);
    nodeCallback = callback;

    mutationObserver.observe(document.body, PAGE_OBSERVER_PARAMETERS);

    addMutatedNode(document.body);
}

function onPageChange(changes) {
    for (var i = 0; i < changes.length; ++i) {
        var pageChange = changes[i];

        if (pageChange.type === 'characterData') {
            addMutatedNode(pageChange.target);
        } else if (pageChange.type === 'childList') {
            for (var index = 0; index < pageChange.addedNodes.length; ++index) {
                var nextNode = pageChange.addedNodes.item(index);

                addMutatedNode(nextNode);

                if (nextNode.tagName === 'IMG') {
                    imageDetected(nextNode);
                }
            }
        }
    }
}

function addMutatedNode(node) {
    if (isIllegalNode(node) === false) {
        mutatedNodes.push(node);
    }

    clearTimeout(iterateNodesCallback);
    iterateNodesCallback = setTimeout(iterateThroughPendingNodes, 1);
}

function iterateThroughPendingNodes() {
    if (currentlyIteratingThroughNodes === false) {
        currentlyIteratingThroughNodes = true;

        var nodesThisIteration = 0;

        console.log('Checking...');

        while (mutatedNodes.length > 0) {
            if (nodesThisIteration === MAX_NODES_PER_ITERATION) {
                break;
            }

            var nextNode = mutatedNodes.pop();

            if (nextNode.nodeType === Node.TEXT_NODE) {
                nodeCallback(nextNode);
            } else if (nextNode.nodeType === Node.ELEMENT_NODE) {
                var children = runTreeWalker(nextNode);

                mutatedNodes = children.concat(mutatedNodes);
            }

            nodesThisIteration++;
        }

        if (mutatedNodes.length > 0) {
            clearTimeout(iterateNodesCallback);
            iterateNodesCallback = setTimeout(iterateThroughPendingNodes, 10);
        }

        currentlyIteratingThroughNodes = false;
    }
}

function runTreeWalker(node) {
    var treeWalker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT + NodeFilter.SHOW_ELEMENT, TREE_WALKER_FILTER, false);
    var treeChild;
    var results = [];

    while ((treeChild = treeWalker.nextNode())) {
        if (isIllegalNode(treeChild) === false) {
            results.push(treeChild);
        }
    }

    return results;
}

function treeWalkerFilterFunction(node) {
    var filter = NodeFilter.FILTER_SKIP;

    if (node.nodeType === Node.TEXT_NODE) {
        filter = NodeFilter.FILTER_ACCEPT;
    } else if (node.nodeType === Node.ELEMENT_NODE) {
        if (node.tagName === 'IFRAME') {
            iframeDetected();
        }
    }

    return filter;
}

function iframeDetected() {
    if (iframeFoundCallback) {
        iframeFoundCallback();

        iframeFoundCallback = null;
    }

    iframeFound = true;
}

function onIframeFound(callback) {
    if (iframeFound === true) {
        callback();
    } else {
        iframeFoundCallback = callback;
    }
}

function imageDetected(imageNode) {
    if (imageFoundCallback) {
        imageFoundCallback(imageNode);
    } else {
        pendingImages.push(imageNode);
    }
}

function onImageFound(callback) {
    imageFoundCallback = callback;

    for (var i = 0; i < pendingImages.length; ++i) {
        imageFoundCallback(callback);
    }

    pendingImages = [];
}

function isIllegalNode(node) {
    var isIllegal = true;

    if (node && (node.nodeType === Node.TEXT_NODE || node.nodeType === Node.ELEMENT_NODE)) {
        var elementNode = node.nodeType === Node.TEXT_NODE ? node.parentNode : node;

        isIllegal = false;

        if (node.nodeType === Node.TEXT_NODE && !elementNode) {
            isIllegal = true;
        } else if (ILLEGAL_TAGNAMES.indexOf(elementNode.tagName) !== -1) {
            isIllegal = true;
        } else if (elementNode.classList.contains('GTETipsy') || elementNode.classList.contains('GTETipsyInner')) {
            isIllegal = true;
        } else if (elementNode.isContentEditable) {
            isIllegal = true;
        } else if (node.textContent.replace(/\s/g, '').length < 2) {
            isIllegal = true;
        } else if (node.isGTENode) {
            isIllegal = true;
        }
    }

    return isIllegal;
}

module.exports = {
    observe: startMutationObserver,
    onIframeFound: onIframeFound,
    onImageFound: onImageFound
};