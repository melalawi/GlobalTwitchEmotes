require('mocha');
var expect = require('chai').expect;
var path = require('path');
var rewire = require('rewire');


var domainFilter = rewire(path.join(process.cwd(), 'domainFilter'));


describe('domainFilter.isURLIllegal Tests', function() {
    var isURLIllegal;

    before(function() {
        isURLIllegal = domainFilter.__get__('isURLIllegal');
    });

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

describe('domainFilter.getFilteredRule Tests', function() {
    var getFilteredRule;

    before(function() {
        getFilteredRule = domainFilter.__get__('getFilteredRule');
    });

    it('Null address', function() {
        expect(getFilteredRule()).to.equal(null);
    });

    it('Not filtered', function() {
        expect(getFilteredRule('http://www.google.ca', ['google.com'])).to.equal(null);
    });

    it('Filtered', function() {
        expect(getFilteredRule('http://www.google.ca/asparagus', ['google.ca/*'])).to.equal('google.ca/*');
    });
});

describe('domainFilter.isFiltered Tests', function() {
    var isFiltered;

    before(function() {
        isFiltered = domainFilter.__get__('isFiltered');
    });

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

describe('domainFilter.createRegexFromRule Tests', function() {
    var createRegexFromRule;

    before(function() {
        createRegexFromRule = domainFilter.__get__('createRegexFromRule');
    });

    it('Undefined rule', function() {
        expect(createRegexFromRule().toString()).to.equal(/^$/i.toString());
    });

    it('Defined rule', function() {
        expect(createRegexFromRule('asdf.com/space character/*').toString()).to.equal(/^asdf.com\/space%20character.*$/i.toString());
    });
});

describe('domainFilter.replaceCharactersWithRegexNotation Tests', function() {
    var replaceCharactersWithRegexNotation;

    before(function() {
        replaceCharactersWithRegexNotation = domainFilter.__get__('replaceCharactersWithRegexNotation');
    });

    it('Undefined input', function() {
        expect(replaceCharactersWithRegexNotation().toString()).to.equal('');
    });

    it('No changes', function() {
        expect(replaceCharactersWithRegexNotation('test').toString()).to.equal('test');
    });

    it('Space test', function() {
        expect(replaceCharactersWithRegexNotation(' t  e s t   ').toString()).to.equal('t%20e%20s%20t');
    });

    it('Backslash test', function() {
        expect(replaceCharactersWithRegexNotation('t\\e\\s\\t').toString()).to.equal('t/e/s/t');
    });

    it('Forward slash asterisk test', function() {
        expect(replaceCharactersWithRegexNotation('test/*/*').toString()).to.equal('test.*');
    });

    it('Asterisk test', function() {
        expect(replaceCharactersWithRegexNotation('***t*e*s**t*').toString()).to.equal('.*t.*e.*s.*t.*');
    });

    it('Multiple changes', function() {
        expect(replaceCharactersWithRegexNotation('www.test.com\\space bar/*/more *  spaces*').toString()).to.equal('www.test.com/space%20bar.*/more%20.*%20spaces.*');
    });
});

describe('domainFilter.removeProtocolFromAddress Tests', function() {
    var removeProtocolFromAddress;

    before(function() {
        removeProtocolFromAddress = domainFilter.__get__('removeProtocolFromAddress');
    });

    it('Unmatched string', function() {
        expect(removeProtocolFromAddress('test')).to.equal('test');
    });

    it('Matched string', function() {
        expect(removeProtocolFromAddress('http://www.test.com')).to.equal('test.com');
    });
});

describe('domainFilter.extractDomainFromAddress Tests', function() {
    var extractDomainFromAddress;

    before(function() {
        extractDomainFromAddress = domainFilter.__get__('extractDomainFromAddress');
    });

    it('Unmatched string', function() {
        expect(extractDomainFromAddress('test')).to.equal('test');
    });

    it('Matched string', function() {
        expect(extractDomainFromAddress('http://www.test.com/stuff')).to.equal('test.com');
    });
});
