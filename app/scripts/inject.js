(function ($, docss) {

    'use strict';

    /**
     * Adds a namespace to all the css selectors
     *
     * Note that this may execute in a web worker
     * thread, so you don't have access to DOM
     * and certain other global properties.
     *
     * @todo Need to skip namespacing html and body elements
     * so that if the user does apply these for global
     * styles (ie fonts), they will pass thru.
     *
     * @private
     */
    var addCSSNamespace = function (css) {

        var namespace = '.docss-example';

        /**
         * Need to purge all comments out before injecting CSS into the DOM. There is an issue if we don't do this
         * when the page is saved (archived) by user via the browser and then the resulting HTML file is then openned.
         * If the CSS comment blocks happen to contain a <style> block, the browser may barf because it ends up seeing
         * a style block inside a style block, even though its in the comments.
         *
         * @param {String} css
         * @return {String}
         */
        function removeCommentBlocks(css) {
            //css = css.replace(/\/[\*]+(.*?)[\*]+\//gm, '');
            var commentBlocks = css.split('/*');
            var i, j;
            css = commentBlocks[0];

            for (i = 1; i < commentBlocks.length; i++) {
                j = commentBlocks[i].indexOf('*/');
                css += j === -1 ? commentBlocks[i] : commentBlocks[i].substr(j + 2);
            }

            return css;
        }

        /**
         * Gets all the indexes in the stylesheet string where a selector occurs
         *
         * @param  {String} css stylesheet as a string
         * @return {Number[]}     collection of indexes where selectors are
         */
        function getSelectorIndexes(css) {
            var selectorRegex = /(\.|#|[a-zA-Z0-9>+~:()\- ,'"=-_\[\]\n\r\t])+\{/gm,
                selectorIndexes = [],
                match;

            // get all the indexes where selectors occur
            while ((match = selectorRegex.exec(css))) { // NOTE: assigning in conditional
                selectorIndexes.push(match);
            }

            return selectorIndexes;
        }

        /**
         * Does the act of parsing the CSS content and adding
         * correct namespace to each selector.
         *
         * @param {String} css
         * @param {String} namespace
         * @returns {string}
         */
        function namespaceCSS(css, namespace) {
            var selectorMatches, // = [0],
                nsCSS = [];

            css = removeCommentBlocks(css);

            if (!css || css.length === 0) {
                return '';
            }

            selectorMatches = getSelectorIndexes(css);
            selectorMatches.push({index: css.length});

            var i, j, k, selectors, len, match, leading, selector;
            var whitespace = '\n\r\t ';

            // go through all the indexes and shove in the ns
            for (i = 0, len = selectorMatches.length - 1; i < len; i++) {
                match = selectorMatches[i];
                selectors = match[0].split(',');
                leading = '';

                for (j = 0; j < selectors.length; j++) {
                    selector = selectors[j];
                    //preserve all leading whitespace before selector
                    //a, b {...} becomes .cls a, .cls b {...} not .cls a,.cls  b {...}
                    leading = '';
                    for (k = 0; k < selector.length; k++) {
                        if (whitespace.indexOf(selector.charAt(k)) === -1) {
                            break;
                        }
                        else {
                            leading += selector.charAt(k);
                        }
                    }
                    selectors[j] = leading + namespace + ' ' + selector.substr(leading.length);
                }

                nsCSS.push(
                    selectors.join(',') +
                        css.substring(match.index + match[0].length, selectorMatches[(i + 1)].index));
            }

            // build back into 1 string
            return nsCSS.join('');
        }

        return namespaceCSS(css, namespace);
    };

    /**
     * Applies namespacing to all CSS selectors then
     * injects the CSS with the new namespace into
     * the current DOM.
     *
     * @param {String} styles
     * @param {String} scripts
     * @return {jQuery.Deferred} jQuery deferred promise object
     */
    docss.inject = function (styles, scripts) {
        var deferred = $.Deferred();

        docss.execute(addCSSNamespace, styles, scripts).done(function (nsCSS) {
            var head = document.getElementsByTagName('head')[0];
            var script = document.createElement('script');
            var style = document.createElement('style');
            style.innerHTML = nsCSS;
            script.innerHTML = scripts;
            head.appendChild(script);
            head.appendChild(style);
            deferred.resolve(nsCSS);
        });

        return deferred.promise();
    };

})(window.jQuery, window.docss);
