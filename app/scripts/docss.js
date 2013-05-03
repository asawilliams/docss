var docss;

(function ($) {

    'use strict';

    /**
     * @private
     * @type {Boolean}
     */
    var isLoaded = false;

    /**
     * @private
     * @type {Boolean}
     */
    var isReady = false;

    /**
     * @private
     * @lends {docss.IOptions.prototype}
     */
    var config;

    /**
     * Static initializer, load all files from config thru the loader, then
     * parse the loader contents into blocks and finally render the css and
     * all blocks back to the DOM.
     *
     * @private
     */
    function init() {
        if (!isLoaded || !isReady) {
            return;
        }

        var deferred = $.Deferred();

        if (!config) {
            config = docss.defaults;
        }

        if (config.done) {
            deferred.promise().done(config.done);
        }

        if (config.title) {
            document.title = config.title;
        }

        var startTime = new Date().getTime(),
            lastTime = startTime,
            currentTime;

        function logPerformance(task) {
            if (!lastTime || task === 'complete') {
                lastTime = startTime;
            }

            currentTime = new Date().getTime();
            console.log('docss took ' + ((currentTime - lastTime) / 1000) + 's to ' + task);
            lastTime = currentTime;
        }

        docss.load(config.files, config.baseURL).done(function (content) {
            //all source files concatenated into single document
            logPerformance('load files');
            docss.parse(content.styles + content.scripts).done(function (data) {
                //all source files parsed into multiple blocks
                logPerformance('parse files');
                docss.inject(content.styles, content.scripts).done(function () {
                    logPerformance('inject namespaced styles');
                    //concatenated CSS is namespace and inject to DOM
                    config.render(data);
                    //parse blocked are rendered to DOM
                    deferred.resolve(data);
                    //all done now
                    logPerformance('render output');
                    logPerformance('complete');
                });
            });
        });
    }

    /**
     * A CSS Documentation generator with inline example usage.
     *
     * @type {Object}
     */
    docss = {
        /**
         * Run Docss with the given options.
         *
         * @param {docss.IOptions} options
         */
        run: function (options) {
            isReady = true;

            //if no options, use the last and re-run
            if (options || !config) {
                config = {};
            }

            $.extend(config, docss.defaults, options || {});

            if ('isLoaded' in config) {//see chrome-extension.js
                isLoaded = true;
            }

            init();
        }
    };

    /********* INITIALIZATION *********/

    /**
     * Note this may not fire if window is already loaded, plugin
     * will side load via config.
     */
    $(window).on('load', function () {
        isLoaded = true;
        init();
    });

})(window.jQuery);