'use strict';

describe('execute.js', function () {

    it('Validate asynchronous script executions', function () {

        var done = false;

        runs(function () {
            function test(data) {
                return data.join(',');
            }

            docss.execute(test, ['1', '2', '3']).done(function (result) {
                expect(result).toBe('1,2,3');
                done = true;
            });
        });

        waitsFor(function () {
            return done;
        }, 'Execution should have completed', 2000);

    });

});