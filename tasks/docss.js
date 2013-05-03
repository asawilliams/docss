//TODO: Shouuld this be moved out to its own github project, registered to npm and add to packages.json?

module.exports = function (grunt) {

    'use strict';

    /**
     * @name IDocssTaskOptions
     * @interface
     * @type {Object}
     */
    /**
     * Name of your project to add to DOCSS document
     * @name IDocssTaskOptions#title
     * @type {String}
     */
    /**
     * Path location to root of docss content directory
     * @name IDocssTaskOptions#docssPath
     * @type {String}
     */
    /**
     * A list of tasks to be executed before docss begins compilation and server execution
     * @name IDocssTaskOptions#pretasks
     * @type {String[]}
     */
    /**
     * A list of files to watch for changes to trigger a reload of docss server
     * @name IDocssTaskOptions#watchfiles
     * @type {String[]}
     */
    /**
     * Optional to override the default host domain used by server
     * @name IDocssTaskOptions#hostdomain
     * @type {String[]}
     */
    /**
     * Optional to override the default port used by server
     * @name IDocssTaskOptions#port
     * @type {String[]}
     */
    /**
     * The base (root) directory from which to host the web server
     * from. By Default this is './' which should be the same location
     * as that grunt is running from. This directory should be a common
     * ancestor to access all docss and source files.
     * @name IDocssTaskOptions#baseDir
     * @type {String[]}
     */

    /**
     *
     * @param {String} task
     * @param {String} target
     * @param {Object} options
     */
    function createSubTaskOptions(task, target, options) {
        var data = grunt.config(task) || {};

        if (!data[target]) {
            data[target] = options;
        }
        else {
            data[target] = grunt.util._.extend(options, data[target]);
        }

        grunt.config(task, data);
    }

    /**
     *
     * @param connect
     * @param dir
     * @returns {*}
     */
    function mountFolder(connect, dir) {
        var path = require('path').resolve(dir);
        return connect.static(path);
    }

    var lrSnippet = require('grunt-contrib-livereload/lib/utils').livereloadSnippet;
    var path = require('path');

    //load the prereq tasks
    grunt.loadNpmTasks('grunt-open');
    grunt.loadNpmTasks('grunt-regarde');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-contrib-livereload');

    /**
     *
     */
    grunt.registerMultiTask('docss', 'Compiles docss and runs a server with a watch for changes', function () {

        /**
         * A custom target name to use for sub tasks that will run in a separate namespace
         * @type {String}
         */
        var subTargetName = this.name + (this.target ? '-' + this.target : '');

        /**
         * A name for an internal subtask created dynamically by this task to be executed
         * to start up the task
         * @type {String}
         */
        var runnerTaskName = '$' + subTargetName + '-runner';

        /**
         * A name for an internal subtask created dynamically by this task to be executed
         * to reload the task after a watch change
         * @type {String}
         */
        var reloadTaskName = '$' + subTargetName + '-reload';

        /**
         * @type {IDocssTaskOptions}
         */
        var data = this.options({
            docssPath: path.relative(process.cwd(), __dirname) + '/../dist',
            pretasks: [],
            host: 'localhost',
            port: '9001',
            watchfiles: ['DOESNOTEXIST'],
            baseDir: './'
        });

        var files = this.filesSrc;

        grunt.registerTask(runnerTaskName, 'Internal execution task for updating docss-run.js', function () {

            /**
             * @type {docss.IOptions}
             */
            var options = {
                files: [],
                title: data.title,
                baseURL: '/'//web host root
            };

            files.forEach(function (file) {
                if (grunt.file.exists(file)) {
                    options.files.push(file);
                }
            });

            //need to make sure to trigger a change to runner to force a page reload with livereload
            //otherwise, if it sees a CSS file changed, it just tries to reload the CSS file
            var runner = 'docss.run(' + JSON.stringify(options) + ');//' + new Date().getTime();
            var runnerPath = data.docssPath;

            if (runnerPath.charAt(runnerPath.length - 1) !== '/') {
                runnerPath += '/';
            }

            runnerPath += 'scripts/docss-run.js';

            grunt.log.writeln('docss runner: ' + runner);
            grunt.log.writeln('writing docss runner to ' + runnerPath);

            grunt.file.write(runnerPath, runner);
        });

        grunt.registerTask(reloadTaskName, 'Internal execution task for reloading the docss server post watch change', function () {
            /*
             Realizing that this is completely hacky, but its the only way to force a
             page reload, otherwise if a CSS file changes, livereload just tries to
             reload <link/> elements on the page, but this CSS file is actually
             something docss will download and parse separately, so we really need
             to reload the page.
             */
            grunt.regarde.changed.unshift('FORCE-RELOAD');

            grunt.task.run(data.pretasks.concat([
                runnerTaskName,
                'livereload:' + subTargetName
            ]));
        });

        createSubTaskOptions('regarde', subTargetName, {
            tasks: [reloadTaskName],
            files: data.watchfiles
        });

        createSubTaskOptions('open', subTargetName, {
            path: 'http://' + data.host + ':' + data.port + '/' + data.docssPath
        });

        createSubTaskOptions('connect', subTargetName, {
            options: {
                hostdomain: data.hostdomain,
                port: data.port,
                keepalive: false,
                middleware: function (connect) {
                    return [
                        lrSnippet,
                        mountFolder(connect, data.baseDir)
                    ];
                }
            }
        });

        grunt.task.run(data.pretasks.concat([
            runnerTaskName,
            'livereload-start:' + subTargetName,
            'open:' + subTargetName,
            'connect:' + subTargetName,
            'regarde:' + subTargetName
        ]));

    });

};

