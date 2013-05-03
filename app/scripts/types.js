/**
 * A list of interfaces for data object types used by Docss.
 * Note that these are interfaces for type casting and not
 * concrete classes you would construct. This is because
 * a number of these are constructed in a worker thread
 * where the shared classes would not be available to
 * the threads scope.
 */
(function () {

    /**
     * @name docss.IOptions
     * @interface docss.IOptions
     */
    var IOptions = {
        /**
         * Give a title to your documentation.
         *
         * @name docss.IOptions#title
         * @type {String}
         */
        title: null,
        /**
         * Change this value as needed for resolving below files.
         * Note this is relative to index.html.
         *
         * @name docss.IOptions#baseURL
         * @type {String}
         */
        baseURL: null,
        /**
         * Change below to link to style sheets you want to document.
         * Note this is relative to baseURL.
         *
         * @name docss.IOptions#files
         * @type {String[]}
         */
        files: null,
        /**
         * Change below as needed to alter how the examples are rendered to screen.
         *
         * @name docss.IOptions#render
         * @function
         * @param {docss.IParserData} data
         */
        render: null,
        /**
         * Optional handler to register for when docss has completed all renderering.
         *
         * @name docss.IOptions#done
         * @function
         * @param {docss.IParserData} data
         */
        done: null
    };

    /**
     * An object representing the parsed data.
     * @name docss.IParserData
     * @interface
     */
    var IParserData = {
        /**
         * @name docss.IParserData#sections
         * @type {docss.ICategory[]}
         */
        categories: null,
        /**
         * @name docss.IParserData#sections
         * @type {docss.ISection[]}
         */
        sections: null,
        /**
         * @name docss.IParserData#examples
         * @type {docss.IExample[]}
         */
        examples: null
    };

    /**
     * An object representing a collection of
     * IExample objects bound by a common section title.
     * @name docss.ISection
     * @interface
     */
    var ISection = {
        /**
         * @name docss.ISection#id
         * @type {String}
         */
        id: null,
        /**
         * @name docss.ISection#title
         * @type {String}
         */
        title: null,
        /**
         * @name docss.ISection#examples
         * @type {docss.IExample[]}
         */
        examples: null
    };

    /**
     * An object representing a collection of
     * ICategory objects bound by a common category title.
     * @name docss.ICategory
     * @interface
     */
    var ICategory = {
        /**
         * @name docss.ICategory#id
         * @type {String}
         */
        id: null,
        /**
         * @name docss.ICategory#title
         * @type {String}
         */
        title: null,
        /**
         * @name docss.ICategory#sections
         * @type {docss.ISection[]}
         */
        sections: null
    };

    /**
     * A class object representing the markup
     * of a selector block and its documentation
     * markup.
     * @name docss.IExample
     * @interface
     */
    var IExample = {
        /**
         * @name docss.IExample#id
         * @type {String}
         */
        id: null,
        /**
         * @name docss.IExample#title
         * @type {String}
         */
        title: null,
        /**
         * @name docss.IExample#section
         * @type {String}
         */
        section: null,
        /**
         * @name docss.IExample#category
         * @type {String}
         */
        category: null,
        /**
         * @name docss.IExample#example
         * @type {docss.IOptionBlock}
         */
        example: null,
        /**
         * @name docss.IExample#javascript
         * @type {docss.IOptionBlock}
         */
        javascript: null,
        /**
         * @name docss.IExample#style
         * @type {docss.IOptionBlock}
         */
        style: null,
        /**
         * @name docss.IExample#description
         * @type {String}
         */
        description: null,
        /**
         * @name docss.IExample#todos
         * @type {String[]}
         */
        todos: null,
        /**
         * @name docss.IExample#warnings
         * @type {String[]}
         */
        warnings: null,
        /**
         * @name docss.IExample#notes
         * @type {String[]}
         */
        notes: null,
        /**
         * @name docss.IExample#tags
         * @type {String[]}
         */
        tags: null
    };

    /**
     * A block which has optional options or flags
     * @name docss.IOptionBlock
     */
    var IOptionBlock = {
        /**
         * @name docss.IOptionBlock#value
         * @type {String}
         */
        value: null,
        /**
         * @name docss.IOptionBlock#options
         * @type {String}
         */
        options: null
    }
});