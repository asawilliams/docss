(function ($, docss) {

    'use strict';

    /**
     * Worker functions that will be responsible
     * for parsing all the source CSS files.
     *
     * Note that this may execute in a web worker
     * thread, so you don't have access to DOM
     * and certain other global properties.
     *
     * @private
     * @return {docss.IParserData}
     */
    var readFiles = function (css) {

        /**
         * Finds all the comment blocks in a stylesheet
         * 
         * @param  {String} css stylesheet as a string
         * @return {String[]}     collection of comment blocks
         */
        function getCommentBlocks(css) {
            return css.match(/\*[^*]*\*+([^\/*][^*]*\*+)*/g);
        }

        /**
         * Returns an array of matching attribute values from
         * a given comment block.
         * 
         * @param {String} block Comment block to parse
         * @param {String} attribute Name of attribute within block to retrieve (ie @title == 'title')
         * @param {Boolean} useOptionBlock Set to return IOptionBlock objects instead of String
         * @return {String[]|docss.IOptionBlock[]}
         */
        function getAttributeValues(block, attribute, useOptionBlock) {
            var match, value, i, switches, stringValue;
            var values = [];
            var exp = new RegExp('(@' + attribute + '(:[A-z]+)*\\s)[^@]+', 'gm');

            while ((match = exp.exec(block))) {
                //look for optional switches on the items, ie @example:hidden and add them to value object
                switches = match[2] || '';
                stringValue = trim(match[0].substr(attribute.length + switches.length + 1).replace(/[\r\n][ \t]*\*/gm, '\n'));
                stringValue = stringValue.split('&#64;').join('@');

                if (useOptionBlock) {
                    switches = switches.split(':');
                    value = {value: stringValue, options: {}};

                    for (i = 1; i < switches.length; i++) {
                        value.options[switches[i]] = true;
                    }
                }
                else {
                    value = stringValue;
                }

                values.push(value);
            }

            return values;
        }

        /**
         * Trims a given string (built-in not included in IE8)
         * @param str
         * @return {*}
         */
        function trim(str) {
            if (!str) {
                return str;
            }

            if (str.trim) {
                return str.trim();
            }

            return str.replace(/^\s+|\s+$/g, '');
        }

        /**
         * Sanitizes a title value for use as element ID value
         *
         * @param value
         * @return {String}
         */
        function sanitize(value) {
            value = value.split(' ').join('-');
            return value.replace(/[^A-z0-9\-_|]/g, '');
        }

        var blocks = getCommentBlocks(css);
        var block, i, len;
        /**
         * @type {docss.IExample[]}
         */
        var examples = [];
        /**
         * @lends {docss.IExample.prototype}
         */
        var example;

        /**
         * Less imports may be followed more than once resulting in
         * duplicate comments in resulting CSS output. Here we will
         * just do a first-in wins rule and don't process the rest.
         * @type {Object}
         */
        var uniqueExamples = {};

        if (blocks) {
            len = blocks.length;

            for (i = 0; i < len; i++) {
                block = blocks[i];
                if (block.search('@title') > -1) {
                    example = {};
                    example.title = getAttributeValues(block, 'title')[0];
                    example.section = getAttributeValues(block, 'section')[0] || example.title;
                    example.category = getAttributeValues(block, 'category')[0] || example.section;
                    example.id = sanitize(example.category + '--' + example.section + '--' + example.title);

                    if (!uniqueExamples[example.id]) {
                        example.example = getAttributeValues(block, 'example', true)[0];
                        example.javascript = getAttributeValues(block, 'javascript', true)[0];
                        example.style = getAttributeValues(block, 'style', true)[0];
                        example.description = getAttributeValues(block, 'description')[0];
                        example.warnings = getAttributeValues(block, 'warning');
                        example.notes = getAttributeValues(block, 'note');
                        example.todos = getAttributeValues(block, 'todo');
                        example.tags = getAttributeValues(block, 'tag');
                        uniqueExamples[example.id] = example;
                        examples.push(example);
                    }
                }
            }
        }

        /**
         * @lends {docss.ISection.prototype}
         */
        var section;
        /**
         * @lends {docss.ICategory.prototype}
         */
        var category;
        var sectionHash = {};
        var categoryHash = {};
        var sections = [];
        var categories = [];
        var catID, secID;

        len = examples.length;

        for (i = 0; i < len; i++) {
            example = examples[i];

            if (!example.section) {
                example.section = example.title;
            }

            if (!example.category) {
                example.category = example.section;
            }

            catID = sanitize(example.category);
            secID = sanitize(example.category + '--' + example.section);

            section = sectionHash[secID];
            category = categoryHash[catID];

            if (!category) {
                category = categoryHash[catID] = {title: example.category, sections: [], id: catID};
                categories.push(category);
            }

            if (!section) {
                section = sectionHash[secID] = {title: example.section, examples: [], id: secID};
                sections.push(section);
                category.sections.push(section);
            }

            section.examples.push(example);
        }

        return {categories: categories, sections: sections, examples: examples};
    };

    /**
     * Parses a CSS document into inspectable
     * blocks based on the comment block
     * markup.
     *
     * @param {String} css
     * @return {jQuery.Deferred} jQuery deferred promise object
     */
    docss.parse = function (css) {
        var deferred = $.Deferred();

        docss.execute(readFiles, css).done(function (result) {
            deferred.resolve(result);
        });

        return deferred.promise();
    };

})(window.jQuery, window.docss);