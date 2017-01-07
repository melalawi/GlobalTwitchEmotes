'use strict';
require('mocha');
var expect = require('chai').expect;
var path = require('path');
var rewire = require('rewire');


var domainFilter = rewire(path.join(process.cwd(), 'domainFilter'));
var isURLIllegal = domainFilter.__get__('isURLIllegal');
var isURLFilteredByUser = domainFilter.__get__('isURLFilteredByUser');
var isFiltered = domainFilter.__get__('isFiltered');


describe('domainFilter.isURLIllegal Tests', function() {
    it('Null parameter', function() {
        expect(isURLIllegal()).to.equal(true);
    });

    it('Illegal URL', function() {
        expect(isURLIllegal('chrome://extensions')).to.equal(true);
    });

    it('Illegal URL: Twitch.tv', function() {
        expect(isURLIllegal('http://twitch.tv/kingdomships')).to.equal(true);
    });

    it('Legal URL', function() {
        expect(isURLIllegal('https://google.ca')).to.equal(false);
    });
});

describe('domainFilter.isURLFilteredByUser Tests', function() {
    it('Null address', function() {
        expect(isURLFilteredByUser()).to.equal(false);
    });

    it('Not filtered', function() {
        expect(isURLFilteredByUser('http://www.google.ca', ['google.com'])).to.equal(false);
    });

    it('Filtered', function() {
        expect(isURLFilteredByUser('http://www.google.ca/asparagus', ['google.ca/*'])).to.equal(true);
    });
});

describe('domainFilter.isFiltered Tests', function() {
    it('Blacklist mode, empty list', function() {
        expect(isFiltered('http://test.com', {
            domainFilterMode: 'Blacklist',
            domainFilterList: []
        })).to.equal(false);
    });

    it('Blacklist mode, not filtered', function() {
        expect(isFiltered('http://test.com', {
            domainFilterMode: 'Blacklist',
            domainFilterList: ['asdf.com/*']
        })).to.equal(false);
    });

    it('Blacklist mode, filtered', function() {
        expect(isFiltered('http://test.com', {
            domainFilterMode: 'Blacklist',
            domainFilterList: ['test.com/*']
        })).to.equal(true);
    });

    it('Whitelist mode, empty list', function() {
        expect(isFiltered('http://test.com', {
            domainFilterMode: 'Whitelist',
            domainFilterList: []
        })).to.equal(false);
    });

    it('Whitelist mode, not filtered', function() {
        expect(isFiltered('http://test.com', {
            domainFilterMode: 'Whitelist',
            domainFilterList: ['test.com/*']
        })).to.equal(false);
    });

    it('Whitelist mode, filtered', function() {
        expect(isFiltered('http://test.com', {
            domainFilterMode: 'Whitelist',
            domainFilterList: ['asdf.com/*']
        })).to.equal(true);
    });
});
