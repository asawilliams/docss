'use strict';

describe('load.js', function () {
    var css;

    it('Validate ability to load CSS files and follow imports', function () {

        var done = false;

        runs(function () {
            docss.load(['load.css', 'load7.less'], './data').done(function (content) {
                css = content.styles;
                expect(typeof(css), 'CSS content was loaded').toBe('string');

                var refs = css.split('begin: load');
                expect(refs.length, '2 root CSS document and 6 imports successfully imported').toBe(9);

                refs = css.split('end: load');
                expect(refs.length, '2 root CSS document and 6 imports successfully imported').toBe(9);

                var less = css.indexOf('.load7 .load7b') > 0;
                expect(less, 'LESS document successfully compiled to CSS').toBe(true);

                less = css.indexOf('@load7') > 0;
                expect(less, 'Block comments are retained in compiled CSS output from LESS file').toBe(true);

                less = css.indexOf('.load8 .load8b') > 0;
                expect(less, 'Imported LESS document successfully compiled to CSS').toBe(true);

                less = css.indexOf('@load8') > 0;
                expect(less, 'Block comments are retained in compiled CSS output from imported LESS file').toBe(true);

                done = true;
            });
        });

        waitsFor(function () {
            return done;
        }, 'Load should have completed', 5000);

    });

    it('Validate ability to resolve URL references from compiled CSS', function () {
        var done = false;

        runs(function () {
            var exp = /url\(['"]?([^'"\(\)]*)['"]?\);/gi;
            var match;
            var urlHash = {};
            var urls = [];

            while ((match = exp.exec(css))) {
                if (!urlHash[match[1]]) {
                    urlHash[match[1]] = true;
                    urls.push($.get(match[1]));
                }
            }

            expect(urls.length, 'All URL references should resolve to same URL path').toBe(1);

            $.when.apply(null, urls).then(function () {
                if (urls.length > 1) {
                    for (var i = 0; i < arguments.length; i++) {
                        expect(arguments[i][1], 'Received success status').toBe('success');
                    }
                }
                else {
                    expect(arguments[1], 'Received success status').toBe('success');
                }
                done = true;
            }, function (error) {
                done = true;
                expect(error).not.toBeDefined();
                throw new Error('Unable to load URL reference from compiled CSS!');
            });
        });

        waitsFor(function () {
            return done;
        }, 'Load should have completed', 5000);
    });

});