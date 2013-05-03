(function (docss) {

    'use strict';

    /**
     * Note, this file should appear AFTER all other scripts for Docss
     *
     * @lends {docss.IOptions.prototype}
     */
    docss.defaults = {};
    docss.defaults.title = document.title || 'docss';
    docss.defaults.baseURL = './styles/';
    docss.defaults.files = [
        'examples/getting-started.css',
        'examples/styleguide.css',
        'examples/bootstrap-docs.css',
        'examples/bootstrap.css'
    ];
    docss.defaults.render = docss.render;

})(window.docss);
