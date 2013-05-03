(function ($, docss, less) {

    'use strict';

    var counter = 0;

    /**
     * @type {Element}
     */
    var loader;

    /**
     * Class object used for storage for pending url
     * requests to load.
     *
     * @private
     * @param {String} url The absolute or relative path of the file to load
     * @param {String} [relativeTo] Optional base path that url will be resolved against
     * @param {String} [replacement] Optional replacement key for where to insert the loaded
     * data into the overall content (used to inline imports).
     * @constructor
     */
    var PendingRequest = function (url, relativeTo, replacement) {
        /**
         * @name PendingRequest#url
         * @type {String}
         */
        this.url = url;
        /**
         * @name PendingRequest#relativeTo
         * @type {String}
         */
        this.relativeTo = relativeTo;
        /**
         * @name PendingRequest#replacement
         * @type {String}
         */
        this.replacement = replacement;
    };

    /**
     * Resolves any relative paths in the data document using the
     * relativeTo option. This will fix paths to load images in
     * the markup.
     *
     * @private
     * @param {String} data The CSS markup to resolve paths from
     * @param {String|} relativeTo Optional base path to resolve relative
     * urls against.
     * @return {String} The updated data with paths resolved
     */
    function fixPaths(data, relativeTo) {
        var exp = /url\(['"]?([^'"\(\)]*)['"]?\);/gi;
        var match;
        var url;

        while ((match = exp.exec(data))) {
            url = 'url(\'' + docss.resolve(match[1], relativeTo) + '\');';
            data = data.split(match[0]).join(url);
            exp.lastIndex -= url.length - match[0].length;
        }

        return data;
    }

    /**
     * Scans the css data markup for imports. Replaces import statements
     * with keys and pushes new pending requests into the queue to process.
     *
     * @private
     * @param {String} data The CSS markup to resolve paths from
     * @param {String} relativeTo Base path to resolve relative
     * @param {PendingRequest[]} queue Queue of pending requests to add to
     * @return {String} The updated data with paths resolved
     */
    function processImports(data, relativeTo, queue) {
        var exp = /@import\s(url\()?['"]?([^'"\(\)]*)['"]?[\)]?;/gi;
        var match;
        var request;

        while ((match = exp.exec(data))) {
            request = new PendingRequest(match[2], relativeTo, 'C$$IMPORT' + (counter++));
            queue.push(request);
            data = data.split(match[0]).join(request.replacement);
            exp.lastIndex = 0;
        }

        return data;
    }

    /**
     * Loads a given CSS file path, follows all imports
     * and inlines them into a single document which is
     * referenced in the contents method.
     *
     * @param {String[]} urls
     * @param {String|} relativeTo
     * @return {jQuery.Deferred} jQuery deferred promise object
     */
    docss.load = function (urls, relativeTo) {

        var deferred = $.Deferred();
        var pending = [];
        var styles = '';
        var scripts = '';

        /**
         * Loads the next request from the queue, processes it upon completion
         * and loads the data into the content property.
         *
         * @private
         */
        function loadNext() {
            if (!finished()) {
                /**
                 * @type {PendingRequest}
                 */
                var request = pending.shift();
                var url = docss.resolve(request.url, request.relativeTo);
                var isLocal = window.location.protocol === 'file:';

                //console.log('loading: ' + url);

                loader = 'docss-loader' in window ? document['docss-loader'].load ? document['docss-loader'] : window['docss-loader'] : null;

                if (isLocal && loader) {
                    //loading local files in local mode is prohibited by Chrome, fallback to Flash
                    var callback = '_callback_load_' + new Date().getTime();
                    docss[callback] = function (data) {
                        processResponse(data, url, request);
                    };
                    loader.load(url, 'docss.' + callback);
                }
                else {
                    $.ajax({url: url, cache: false, dataType: 'text'}).done(function (data) {
                        //console.log('loaded: ' + url);
                        processResponse(data, url, request);
                    }).error(function () {
                            if (isLocal) {
                                console.log('Falling back to Flash mode for local file access:' + url);
                                setupFlashLoader();
                            }
                            else {
                                console.log('Unable to load data from URL:' + url);
                            }
                        });
                }
            }
        }

        /**
         * Uses a fallback to Flash to load from local file
         * system on browsers which have a sandbox which
         * prohibits such behavior.
         */
        function setupFlashLoader() {
            var timestamp = new Date().getTime();
            var $obj = $('<object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" id="docss-loader" width="1" height="1" codebase="http://download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab"></object>');
            $obj.append('<param name="movie" value="loader.swf?_=' + timestamp + '"/>');
            $obj.append('<param name="allowScriptAccess" value="always"/>');
            $obj.append('<embed src="loader.swf?_=' + timestamp + '" width="1" height="1" name="docss-loader" allowScriptAccess="always" type="application/x-shockwave-flash" pluginspage="http://www.macromedia.com/go/getflashplayer"></embed>');
            $('body').append($obj);
            //SWF will execute docss.run(); again to start over
        }

        /**
         * Process the data returned from the loaded file.
         * @param {String} data
         * @param {String} url
         * @param {PendingRequest} request
         */
        function processResponse(data, url, request) {
            var type = url.substr(url.lastIndexOf('.') + 1).toLowerCase();
            switch (type) {
            case 'less':
                var base = docss.resolve('{{FAKE_PLACEHOLDER}}', url);
                base = base.substr(0, base.indexOf('{{FAKE_PLACEHOLDER}}'));

                var parser = new less.Parser({
                    paths: [base, '']
                });
                parser.parse(data, function (e, ruleset) {
                    if (request.relativeTo) {
                        processCSS(ruleset.toCSS(), url, request);
                    }
                    else {
                        console.log('Error parsing LESS file', e);
                        loadNext();
                    }
                });
                break;
            case 'js':
                scripts += '\n\n/*********************\n' + url + '\n*********************/\n\n';
                scripts += data;
                loadNext();
                break;
            case 'scss':
            case 'sass':
                //TODO: for possible later use
                console.log('docss doesn\'t currently support SASS/SCSS type files', url);
                loadNext();
                break;
            default:
                processCSS(data, url, request);
                break;
            }
        }

        /**
         * Process source CSS content
         * @param {String} css
         * @param {String} url
         * @param {PendingRequest} request
         */
        function processCSS(css, url, request) {
            css = processImports(css, url, pending);//do this first as urlxp will match importxp
            css = fixPaths(css, url);

            styles += '\n\n/*********************\n' + url + '\n*********************/\n\n';

            if (request.replacement) {
                styles = styles.split(request.replacement).join(css);
            }
            else {
                styles += css;
            }

            loadNext();
        }

        /**
         * Determines if there are no more requests pending and
         * if so, resolves the current deferred object with the
         * processed content.
         *
         * @private
         * @return {Boolean}
         */
        function finished() {
            if (pending.length === 0) {
                deferred.resolve({styles: styles, scripts: scripts});

                if (loader) {
                    //remove this so it doesn't get saved with page
                    loader.parentNode.removeChild(loader);
                }

                return true;
            }

            return false;
        }

        /********* INITIALIZATION *********/

        var i = 0;
        var len = urls ? urls.length : 0;

        for (i; i < len; i++) {
            pending.push(new PendingRequest(urls[i], relativeTo, null));
        }

        loadNext();

        return deferred.promise();
    };

})(window.jQuery, window.docss, window.less);