// Generated on 2013-03-18 using generator-webapp 0.1.5

'use strict';

var lrSnippet = require('grunt-contrib-livereload/lib/utils').livereloadSnippet;
var mountFolder = function (connect, dir) {
    return connect.static(require('path').resolve(dir));
};

module.exports = function (grunt) {

    // load all grunt tasks
    require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);
    grunt.loadTasks('tasks');

    // configurable paths
    var yeomanConfig = {
        app: 'app',
        dist: 'dist'
    };

    grunt.initConfig({
        yeoman: yeomanConfig,
        regarde: {
            livereload: {
                files: [
                    '<%= yeoman.app %>/*.html',
                    '{.tmp,<%= yeoman.app %>}/styles/{,*/}*.css',
                    '{.tmp,<%= yeoman.app %>}/scripts/{,*/}*.js',
                    '<%= yeoman.app %>/images/{,*/}*.{png,jpg,jpeg,webp}'
                ],
                tasks: ['livereload']
            }
        },
        connect: {
            options: {
                port: 9000,
                // change this to '0.0.0.0' to access the server from outside
                hostname: 'localhost'
            },
            livereload: {
                options: {
                    middleware: function (connect) {
                        return [
                            lrSnippet,
                            mountFolder(connect, '.tmp'),
                            mountFolder(connect, 'app')
                        ];
                    }
                }
            },
            test: {
                options: {
                    middleware: function (connect) {
                        return [
                            mountFolder(connect, './')
                        ];
                    }
                }
            },
            dist: {
                options: {
                    middleware: function (connect) {
                        return [
                            mountFolder(connect, 'dist')
                        ];
                    }
                }
            }
        },
        open: {
            server: {
                path: 'http://localhost:<%= connect.options.port %>'
            },
            test: {
                path: 'http://localhost:<%= connect.options.port %>/test'
            }
        },
        clean: {
            dist: ['.tmp', '<%= yeoman.dist %>/*'],
            server: '.tmp'
        },
        jshint: {
            options: {
                jshintrc: '.jshintrc'
            },
            all: [
                '<%= yeoman.app %>/scripts/{,*/}*.js',
                '!<%= yeoman.app %>/scripts/vendor/*',
                '!<%= yeoman.app %>/scripts/types.js',
                'test/spec/{,*/}*.js',
                'tasks/{,*/}*.js'
            ]
        },
        jasmine: {
            all: {
                src: ['http://localhost:<%= connect.options.port %>/test'],
                errorReporting: true
            }
        },
        uglify: {
            dist: {
                files: {
                    '<%= yeoman.dist %>/scripts/main.js': [
                        '<%= yeoman.app %>/scripts/{,*/}*.js'
                    ]
                }
            }
        },
        useminPrepare: {
            html: '<%= yeoman.app %>/index.html',
            options: {
                dest: '<%= yeoman.dist %>'
            }
        },
        usemin: {
            html: ['<%= yeoman.dist %>/*.html'],
            css: ['<%= yeoman.dist %>/styles/*.css'],
            options: {
                dirs: ['<%= yeoman.dist %>']
            }
        },
        imagemin: {
            dist: {
                files: [
                    {
                        expand: true,
                        cwd: '<%= yeoman.app %>/images',
                        src: '{,*/}*.{png,jpg,jpeg}',
                        dest: '<%= yeoman.dist %>/images'
                    }
                ]
            }
        },
        cssmin: {
            dist: {
                files: {
                    //docss:begin
                    //'<%= yeoman.dist %>/styles/main.css': [
                    //    '.tmp/styles/{,*/}*.css',
                    //    '<%= yeoman.app %>/styles/{,*/}*.css'
                    //]
                    //docss:end
                }
            }
        },
        htmlmin: {
            dist: {
                options: {
                    /*removeCommentsFromCDATA: true,
                     // https://github.com/yeoman/grunt-usemin/issues/44
                     //collapseWhitespace: true,
                     collapseBooleanAttributes: true,
                     removeAttributeQuotes: true,
                     removeRedundantAttributes: true,
                     useShortDoctype: true,
                     removeEmptyAttributes: true,
                     removeOptionalTags: true*/
                },
                files: [
                    {
                        expand: true,
                        cwd: '<%= yeoman.app %>',
                        src: '*.html',
                        dest: '<%= yeoman.dist %>'
                    }
                ]
            }
        },
        copy: {
            dist: {
                files: [
                    {
                        expand: true,
                        dot: true,
                        cwd: '<%= yeoman.app %>',
                        dest: '<%= yeoman.dist %>',
                        src: [
                            '*.{ico,txt}',
                            '.htaccess',
                            //docss:begin
                            'loader.swf',
                            'styles/examples/**/*'
                            //docss:end
                        ]
                    }
                ]
            },
            "chrome-ext": {
                files: [
                    {
                        expand: true,
                        dot: true,
                        cwd: '<%= yeoman.app %>',
                        dest: '<%= yeoman.dist %>',
                        src: [
                            'manifest.json',
                            'scripts/chrome-background.js'
                        ]
                    }
                ]
            }
        },
        pkg: grunt.file.readJSON('package.json'),
        manifest: grunt.file.readJSON('app/manifest.json'),
        compress: {
            "dist": {
                src: [
                    "dist/**/*"
                ],
                options: {
                    archive: "bin/<%= pkg.name %>-<%= pkg.version %>.zip"
                }
            }
        },
        crx: {
            all: {
                src: "dist",
                dest: "bin",
                privateKey: "app.pem",
                baseURL: "http://docss.cynergy.com/downloads/",
                filename: "<%= pkg.name %>-<%= pkg.version %>-chrome-extension.crx"
            }
        },
        replace: {
            "chrome-ext": {
                options: {
                    variables: {
                        version: "<%= pkg.version %>"
                    },
                    force: true,
                    prefix: "##="
                },
                files: [
                    {
                        src: ["app/manifest.json"],
                        dest: "dist/manifest.json"
                    },
                    {
                        src: ["app/scripts/chrome-background.js"],
                        dest: "dist/scripts/chrome-background.js"
                    }
                ]
            },
            "dist": {
                options: {
                    variables: {
                        version: "<%= pkg.version %>"
                    },
                    force: false,
                    prefix: "##="
                },
                files: [
                    {
                        expand: true,
                        flatten: false,
                        src: ["dist/**/*"],
                        dest: ""
                    }
                ]
            }
        },
        'docss': {
            all: {
                src: [
                    'dist/styles/examples/styleguide.css',
                    'dist/styles/examples/bootstrap-docs.css',
                    'dist/styles/examples/bootstrap.css',
                    'app/scripts/types.js'
                ],
                options: {
                    title: '<%= pkg.name %>',
                    //docssPath: 'dist',
                    pretasks: ['build'],
                    watchfiles: [
                        'app/scripts/**/*.js',
                        'app/styles/**/*.css',
                        'app/*.html'
                    ]
                }
            }
        }
    });

    grunt.registerTask('server', function (target) {
        if (target === 'dist') {
            return grunt.task.run(['build', 'open:server', 'connect:dist:keepalive']);
        }

        if (target === 'test') {
            return grunt.task.run(['clean:server', 'open:test', 'connect:test:keepalive']);
        }

        grunt.task.run([
            'clean:server',
            'livereload-start',
            'connect:livereload',
            'open:server',
            'regarde'
        ]);
    });

    grunt.registerTask('test', [
        'clean:server',
        'connect:test',
        'jasmine'
    ]);

    grunt.registerTask('build', [
        'clean:dist',
        'useminPrepare',
        'imagemin',
        'htmlmin',
        'concat',
        'cssmin',
        'copy:dist',
        'usemin',
        'replace:dist',
        'compress:dist'//,
        //'replace:chrome-ext',
        //'crx'
    ]);

    grunt.registerTask('default', [
        'jshint',
        'test',
        'build'
    ]);

};
