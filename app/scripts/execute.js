(function ($, URL, Worker, Blob) {

    'use strict';

    /**
     * Set true to enable debugging and bypass Worker thread
     * @type {boolean}
     */
    var debugging = false;

    /**
     * Execute a function on a worker thread
     * if available. Returns a promise which
     * you can register a done handler of to
     * be fired upon completion.
     *
     * @param {Function} func
     * @param {*} data
     * @return {*} jQuery deferred promise object
     */
    docss.execute = function (func, data) {
        var deferred = $.Deferred();

        if (!debugging && Worker && Blob && URL && URL.createObjectURL) {
            var code = 'var func = ' + func.toString() + '; onmessage = function(event){ postMessage(func(event.data)); };';
            var url = URL.createObjectURL(new Blob([code], {type: 'text/javascript'}));
            var worker = new Worker(url);
            worker.addEventListener('message', function (event) {
                URL.revokeObjectURL(url);
                deferred.resolve(event.data);
            }, false);
            worker.postMessage(data);
        }
        else {
            setTimeout(function () {
                deferred.resolve(func(data));
            }, 16.7);
        }

        return deferred.promise();
    };

})(window.jQuery, window.URL, window.Worker, window.Blob);