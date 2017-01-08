require('mocha');
var expect = require('chai').expect;
var JSDom = require('jsdom');
var path = require('path');
var rewire = require('rewire');


var pageObserver = rewire(path.join(process.cwd(), 'contentscript/pageObserver'));
var isIllegalNode = pageObserver.__get__('isIllegalNode');


// Rewire doesn't want to override undefined variables unless we defined them in the global scope as such
global.window = {};
global.document = {};
global.Node = {};


describe('pageObserver.isIllegalNode Tests', function() {
    before(function(done) {
        JSDom.env({
            html: '<html><head></head><body></body></html>',
            done: function(errors, window) {
                pageObserver.__set__('window', window);
                pageObserver.__set__('document', window.document);
                pageObserver.__set__('Node', window._core.Node.prototype);

                done();
            }
        });
    });

    it('Null node', function() {
        expect(isIllegalNode()).to.equal(true);
    });

    it('Element node with no parent', function() {
        var node = document.createElement('div');

        node.textContent = 'foo';

        expect(isIllegalNode(node)).to.equal(false);
    });

    it('Text node with no parent', function() {
        var textNode = document.createTextNode('foo');

        expect(isIllegalNode(textNode)).to.equal(true);
    });

    it('Invalid tagName', function() {
        var scriptNode = document.createElement('noscript');

        scriptNode.textContent = 'foo';
        document.head.appendChild(scriptNode);

        expect(isIllegalNode(scriptNode)).to.equal(true);
    });

    it('contenteditable node', function() {
        var node = document.createElement('div');

        node.isContentEditable = true;
        node.textContent = 'foo';
        document.body.appendChild(node);

        expect(isIllegalNode(node)).to.equal(true);
    });

    it('textnode, little text', function() {
        var node = document.createTextNode('a');

        document.body.appendChild(node);

        expect(isIllegalNode(node)).to.equal(true);
    });

    it('Element node with GTETipsy class', function() {
        var node = document.createElement('div');

        node.className = 'GTETipsy';
        node.textContent = 'foo';
        document.body.appendChild(node);

        expect(isIllegalNode(node)).to.equal(true);
    });

    it('Text node with isGTETipsy property', function() {
        var node = document.createTextNode('bar');

        node.isGTENode = true;
        document.body.appendChild(node);

        expect(isIllegalNode(node)).to.equal(true);
    });

    it('Happy case', function() {
        var node = document.createTextNode('bar');

        document.body.appendChild(node);

        expect(isIllegalNode(node)).to.equal(false);
    });
});
