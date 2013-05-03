'use strict';

describe('resolve.js', function () {

    it('Validate ability to resolve relative URLs', function () {
        var base = document.createElement('base');
        base.href = './';
        base = base.href;

        var url = docss.resolve('load.css', './data/');
        expect(url).toBe(base + 'data/load.css');

        url = docss.resolve('load.css', './data');
        expect(url).toBe(base + 'data/load.css');

        url = docss.resolve('data/load.css', './');
        expect(url).toBe(base + 'data/load.css');

        url = docss.resolve('data/load.css', 'index.html');
        expect(url).toBe(base + 'data/load.css');

        url = docss.resolve('data/load.css', './index.html');
        expect(url).toBe(base + 'data/load.css');

        url = docss.resolve('data/load.css', 'http://www.google.com');
        expect(url).toBe('http://www.google.com/data/load.css');

        url = docss.resolve('data/load.css', 'http://www.google.com/');
        expect(url).toBe('http://www.google.com/data/load.css');
    });

});