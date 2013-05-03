(function (docss) {

    'use strict';

    /**
     * @lends {docss.IOptions.prototype}
     */
    var options = {};

    /**
     * Change this value as needed for resolving below files.
     * Note this is relative to index.html.
     *
     * By default, Docss assumes that it is installed as a sub
     * directory to your projects root directory. As such, if
     * you uncomment below, it will look for all files in a
     * folder called 'styles' one level back from the current
     * directory Docss is in.
     */
    //options.baseURL = '../styles/';

    /**
     * Change below to link to style sheets you want to document.
     * Note this is relative to baseURL.
     */
    //options.files = ['file1.css', 'file2.less'];

    /**
     * (Optional) Change below as needed to alter how the examples are rendered to screen.
     * @param {docss.IParserData} data
     */
    /*options.render = function(data) {

     };*/

    /**
     * (Optional) Handler to register for when docss has completed all renderering.
     * @param {docss.IParserData} data
     */
    /*options.done = function(data) {

     };*/

    docss.run(options);

})(window.docss);