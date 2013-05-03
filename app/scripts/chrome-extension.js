(function ($, chrome, docss) {

    'use strict';

    /**
     * The current browser tab we are inspecting.
     *
     * @see http://developer.chrome.com/extensions/tabs.html#type-Tab
     */
    var tab;

    /**
     * List of defaultStyleSheets defined before we
     * wipe them out. We may reapply these if there are no
     * example docs.
     *
     * @type {String[]}
     */
    var defaultStyleSheets;

    /**
     * Initialization sequence once plugin is ready and
     * tab is identified.
     *
     * TODO: need to do some fail-safe checks for current page
     */
    function init() {
        $('html').addClass('chrome-extension');

        executeInTab(getStyleSheets).done(function (styleSheets) {
            docss.run(/**@lends {docss.IOptions.prototype}*/{
                files: styleSheets,
                baseURL: tab.url,
                title: tab.title,
                done: function (data) {
                    if (!data.examples || data.examples.length === 0) {
                        //there are no examples in what was loaded, show the defaults
                        docss.run(/**@lends {docss.IOptions.prototype}*/{
                            files: defaultStyleSheets,
                            title: tab.title
                        });
                    }
                }
            });
        });
    }

    /**
     * Executes the body of the function
     * in the attached tab window.
     *
     * @param {Function} func
     * @return {jQuery.Deferred} jQuery deferred promise object when the execution is complete
     * @see http://api.jquery.com/category/deferred-object/
     */
    function executeInTab(func) {
        var deferred = $.Deferred();
        var details = {
            code: '(' + func.toString() + ')();',
            allFrames: false,
            runAt: 'document_idle'
        };
        chrome.tabs.executeScript(tab.id, details, function (result) {
            deferred.resolve(result && result.length === 1 ? result[0] : result);
        });
        return deferred;
    }

    /**
     * This will execute in the context of the browser window/tab
     * that is controlled by the plugin. It will return a list of
     * URL's for all style sheets listed in the current page.
     *
     * @return {String[]}
     */
    function getStyleSheets() {
        var elements = document.getElementsByTagName('link');
        var i, element, href;
        var styleSheets = [];
        var processed = {};

        for (i = 0; i < elements.length; i++) {
            element = elements[i];
            href = element.href;

            if (!href) {
                continue;
            }

            if (href.toLowerCase().indexOf('.css') > 0) {
                if (!processed[href]) {
                    processed[href] = true;
                    styleSheets.push(href);
                }
            }
        }

        return styleSheets;
    }

    /********* INITIALIZATION *********/

    if (docss && chrome && chrome.extension) {
        defaultStyleSheets = docss.defaults.files;
        docss.defaults.files = null;//clear this out so it won't run

        var tabid = parseInt(location.search.substr(1), 10);
        chrome.tabs.get(tabid, function (_tab) {
            tab = _tab;
            init();
        });
    }

})(window.jQuery, window.chrome, window.docss);