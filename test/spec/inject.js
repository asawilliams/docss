'use strict';

describe('inject.js', function () {

    it('Validate ability to namespace and inject CSS into the DOM', function () {

        var ns = '.example';
        var oldStyles = $('head > style');
        var done = false;

        runs(function () {
            $.get('data/inject.css?' + new Date().getTime(), function (css) {
                docss.inject(css, ns).done(function (nscss1) {
                    var newStyles = $('head > style');
                    expect(newStyles.length - oldStyles.length).toBe(1);

                    $.get('data/inject2.css?' + new Date().getTime(), function (nscss2) {
                        expect(nscss1).toBe(nscss2);
                        done = true;
                    });
                });
            });
        });
        
        waitsFor(function () {
            return done;
        }, 'Loading of CSS should have completed', 2000);
        
    });

});