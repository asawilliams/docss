(function ($, docss, document) {

    'use strict';

    /**
     * Max length of a given protocal, ie: http://, https://,
     * file://, file:///
     *
     * @private
     * @type {Number}
     */
    var PROTOCOL_LENGTH = 8;

    /**
     * @private
     */
    var docBase;

    /**
     * Determines if a given URL is in absolute form
     * @param {String} url
     * @return {Boolean} True if URL begins with http://, https:// or file://
     */
    function isAbsolute(url) {
        if (!url) {
            return false;
        }

        url = url.toLowerCase();

        var index = url.indexOf('://');
        if (index > 0) {
            var protocol = url.substr(0, index);
            switch (protocol) {
            case 'http':
            case 'https':
            case 'file':
            case 'chrome-extension':
                return true;
            default:
                return false;
            }
        }

        return false;

        //return url.indexOf('http://') == 0 || url.indexOf('https://') == 0 || url.indexOf('file://') == 0;
    }

    /**
     * Determines if a given URL is a file, otherwise a directory
     * @param {String} url An absolute URL path
     * @return {Boolean} True if URL points to a file, false if a directory
     */
    function isFile(url) {
        url = url.substring(url.lastIndexOf('/', PROTOCOL_LENGTH) + 1);
        return !!url.match(/\/[A-z0-9\-_]+\.[A-z0-9\-_]{1,4}/);
    }

    /**
     * Resolves a given url to an absolute URL
     * given a base URL.
     *
     * @param {String} url
     * @param {String} [base]
     * @return {String} The resolved absolute url
     */
    docss.resolve = function (url, base) {
        if (isAbsolute(url)) {
            return url;
        }

        if (!base) {
            base = docss.defaults.baseURL;
        }

        if (url.indexOf('./') === 0) {
            url = url.substring(2);
        }

        if (!isAbsolute(base)) {//base is actually relative to current document
            if (!docBase) {
                //check if document has an explicit base
                var bases = document.getElementsByTagName('base');
                docBase = bases && bases.length > 0 ? bases[0].href : null;
            }
            if (!docBase) {
                //create an implicit base
                docBase = document.createElement('base');
                docBase.href = './';
                docBase = docBase.href;
            }
            base = docss.resolve(base, docBase);
        }

        if (isFile(base)) {
            base = base.substring(0, base.lastIndexOf('/') + 1);
        }

        if (base.charAt(base.length - 1) !== '/') {
            base += '/';
        }

        var slash;

        if (url.charAt(0) === '/') {//url is absolute from a base
            slash = base.indexOf('/', PROTOCOL_LENGTH);
            if (slash === -1) {
                slash = base.length;
            }
        }
        else {//url is completely relative
            slash = base.lastIndexOf('/') + 1;
            if (slash <= PROTOCOL_LENGTH) {
                base += '/';
                slash = base.length;
            }
        }

        if (slash > 0) {
            url = base.substring(0, slash) + url;
        }

        return url;
    };

})(window.jQuery, window.docss, window.document);