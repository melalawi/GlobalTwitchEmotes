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
const CURRENT_HOSTNAME = window.location.hostname.toLowerCase();
const MAX_TREE_WALKER_RUNS_PER_ITERATION = 5;
const MAX_NODES_PER_ITERATION = 1;

var treeWalkers = [];
var mutatedNodes = [];
var mutationObserver;
var nodeCallback;
var iframeFoundCallback;
var imageFoundCallback;

var pendingImages = [];
var iframeFound = false;
var currentlyIteratingThroughTreeWalkers = false;
var currentlyIteratingThroughNodes = false;
var iterateTreeWalkersCallback;
var iterateNodesCallback;
var pageURL = '';


function startMutationObserver(callback) {
    nodeCallback = callback;

    if (document.body) {
        beginObserving();
    } else {
        document.addEventListener('DOMContentLoaded', beginObserving)
    }
}

function beginObserving() {
    mutationObserver = new MutationObserver(onPageChange);
    mutationObserver.observe(document.body, PAGE_OBSERVER_PARAMETERS);

    addMutatedNode(document.body);
}

function onPageChange(changes) {
    //Special case for youtube, since the page doesn't fully 'refresh' when changing videos
    if(CURRENT_HOSTNAME === 'www.youtube.com' || CURRENT_HOSTNAME === 'music.youtube.com') {
        if(pageURL != '' && pageURL != window.location.href) {
            fixModifiedNodes();
        }
    }

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
    pageURL = window.location.href;
}

function fixModifiedNodes() {
    (function scanSubTree(node) {
        if (node.childNodes.length)
            for (var i = 0; i < node.childNodes.length; i++)
                scanSubTree(node.childNodes[i]);
        else if (node.className === "GTEEmote") {
            while (node.nextSibling != null && (node.nextSibling.isGTENode || node.nextSibling.className === 'GTEEmote')) {
                node.nextSibling.remove();
            }
            if(node.previousSibling != null && node.previousSibling.isGTENode) {
                delete node.previousSibling.isGTENode;
            }
            node.remove();
        }
    })(document.body);
}

function addMutatedNode(node) {
    if (isIllegalNode(node) === false) {
        mutatedNodes.push(node);
    }

    clearTimeout(iterateNodesCallback);
    iterateNodesCallback = setTimeout(iterateThroughPendingNodes, 0);
}

function iterateThroughPendingNodes() {
    if (currentlyIteratingThroughNodes === false) {
        currentlyIteratingThroughNodes = true;

        var nodesThisIteration = 0;

        while (mutatedNodes.length > 0) {
            if (nodesThisIteration === MAX_NODES_PER_ITERATION) {
                break;
            }

            var nextNode = mutatedNodes.shift();

            if (nextNode.nodeType === Node.TEXT_NODE) {
                nodeCallback(nextNode);
            } else if (nextNode.nodeType === Node.ELEMENT_NODE) {
                addTreeWalker(nextNode);
            }

            nodesThisIteration++;
        }

        currentlyIteratingThroughNodes = false;

        if (mutatedNodes.length > 0) {
            clearTimeout(iterateNodesCallback);
            iterateNodesCallback = setTimeout(iterateThroughPendingNodes, 0);
        }
    }
}

function addTreeWalker(node) {
    treeWalkers.push(document.createTreeWalker(node, NodeFilter.SHOW_TEXT + NodeFilter.SHOW_ELEMENT, TREE_WALKER_FILTER, false));

    clearTimeout(iterateTreeWalkersCallback);
    iterateTreeWalkersCallback = setTimeout(runTreeWalker, 0);
}

function runTreeWalker() {
    if (currentlyIteratingThroughTreeWalkers === false) {
        currentlyIteratingThroughTreeWalkers = true;

        var treeWalkerRuns = 0;

        treeWalkerLoop: while (treeWalkers.length > 0) {
            var treeWalker = treeWalkers[0];
            var treeChild;

            while ((treeChild = treeWalker.nextNode())) {
                addMutatedNode(treeChild);
                treeWalkerRuns++;

                if (treeWalkerRuns === MAX_TREE_WALKER_RUNS_PER_ITERATION) {
                    break treeWalkerLoop;
                }
            }

            treeWalkers.shift();
        }

        currentlyIteratingThroughTreeWalkers = false;

        if (treeWalkers.length > 0) {
            clearTimeout(iterateTreeWalkersCallback);
            iterateTreeWalkersCallback = setTimeout(runTreeWalker, 0);
        }
    }
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
        } else if (elementNode.classList.value.indexOf('GTETipsy') !== -1 || CURRENT_HOSTNAME.indexOf('twitch.tv') !== -1 && elementNode.classList.value.indexOf('tooltip') !== -1) {
            isIllegal = true;
        } else if (elementNode.isContentEditable) {
            isIllegal = true;
        } else if (node.textContent.replace(/\s/g, '').length === 0) {
            isIllegal = true;
        } else if (node.hasOwnProperty('isGTENode') === true) {
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
