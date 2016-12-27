'use strict';
require('mocha');
var expect = require('chai').expect;
var path = require('path');
var rewire = require('rewire');


var pageObserver = rewire(path.join(process.cwd(), 'src/common/contentscript/pageObserver'));
var getClassName = pageObserver.__get__('getClassName');


describe('pageObserver.getClassName Tests', function() {
    it('Null node', function() {
        expect(getClassName()).to.equal('');
    });

    it('Empty node', function() {
        expect(getClassName({})).to.equal('');
    });

    it('Single ClassName node', function() {
        var node = {
            className: 'foo'
        };

        expect(getClassName(node)).to.equal('foo');
    });

    it('SVGAnimatedString node', function() {
        var node = {
            className: {
                animVal: 'foo',
                baseVal: 'bar'
            }
        };

        expect(getClassName(node)).to.equal('bar');
    });
});