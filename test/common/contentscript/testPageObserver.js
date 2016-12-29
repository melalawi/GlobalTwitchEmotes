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

    it('No classnames', function() {
        var node = {
            classList: {
                value: ''
            }
        };

        expect(getClassName(node)).to.equal('');
    });

    it('Has classnames', function() {
        var node = {
            classList: {
                value: 'foo bar'
            }
        };

        expect(getClassName(node)).to.equal('foo bar');
    });
});