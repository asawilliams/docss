(function ($, docss, Mustache) {

    //'use strict';

    /**
     * Used for Mustache data template
     * @this {*}
     * @return {String}
     */
    /*jshint strict:false */
    function getValue() {
        return this.toString();
    }

    /**
     * Used for Mustache data template
     * @this {docss.IOptionBlock}
     * @return {String}
     */
    /*jshint strict:false */
    function getJavascriptBlock() {
        return this ? '<script type="text/javascript">' + this.value + '</script>' : '';
    }

    /**
     * Used for Mustache data template
     * @this {docss.IOptionBlock}
     * @return {String}
     */
    /*jshint strict:false */
    function getStyleBlock() {
        return this ? '<style type="text/css"" scoped>' + this.value + '</style>' : '';
    }

    /**
     * Triggered when hash in URL is changed, update scrollspy.
     * Note this was moved out of render as in save for offline
     * mode, render is never called because there is nothing
     * to load, content state is saved.
     */
    function hashChanged() {
        var hash = window.location.hash;
        var $articles = $('article');
        var $navs = $('nav.docss li');

        if (hash) {
            var parts = hash.split('--');
            var section = parts[0];
            var $article = $(section);

            if ($article.is('article')) {
                $articles.removeClass('active');
                $article.addClass('active');
                $navs.removeClass('active');
                $('a[href=\'' + section + '\']').parent('li').addClass('active');
                $('a[href=\'' + hash + '\']').parent('li').addClass('active');

                if (parts.length === 1) {
                    //no sub-section selected, clear scroll position
                    $(window).scrollTop(0);
                }
            }
        }
        else {
            $articles.removeClass('active');
            $articles.first().addClass('active');
            $navs.first().addClass('active');
        }

        refreshScrollSpy();
    }

    /**
     * When layout changes, need to refresh positions
     * of matching anchors for scroll spy.
     */
    function refreshScrollSpy() {
        $('[data-spy="scroll"]').each(function () {
            $(this).scrollspy('refresh');
        });
    }

    /**
     * Chrome changes all href values to absolute when saving page for offline use.
     * Also, it will change the href values that match the current URL (say #home)
     * to be a local reference to the current HTML file with NO hash value. Awesome.
     */
    function fixHrefs() {
        $('a.docss[data-href]').each(function () {
            this.href = this.dataset.href;//original value
        });
    }

    /**
     * Validates ability of Docss to run in current mode
     */
    function validate() {
        var protocol = window.location.protocol;
        if (protocol === 'file:') {
            var articles = document.getElementsByTagName('article');
            if (!articles || articles.length === 0) {
                //we have no pre-rendered offline content and running in local (file) mode
                $('#docss-protocol-unsupported').show();
            }
        }
    }

    $(window).on({
        'hashchange': function () {
            hashChanged();
        },
        'load': function () {
            validate();
            fixHrefs();
        },
        'resize': function () {
            refreshScrollSpy();
        }
    });

    /**
     * Renders out all blocks using templates out to the DOM
     *
     * @param {docss.IParserData} data
     */
    docss.render = function (data) {
        var $body = $('body');
        var content = $('#docss-content-tmpl').html();
        var header = $('#docss-header-tmpl').html();
        var currentHash = window.location.hash;

        //remove any previous content
        $body.children(':not(script)').remove();

        $body.append(Mustache.render(header, {
            categories: data.categories,
            title: document.title
        }));

        $body.append(Mustache.render(content, {
            categories: data.categories,
            value: getValue,
            javascriptBlock: getJavascriptBlock,
            styleBlock: getStyleBlock
        }));

        prettyPrint();

        window.location.hash = '#' + new Date().getTime();
        window.location.hash = currentHash;
    };

})(window.jQuery, window.docss, window.Mustache);