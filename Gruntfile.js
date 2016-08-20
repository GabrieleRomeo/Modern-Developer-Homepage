'use strict';

module.exports = function (grunt) {
    // show elapsed time at the end
    require('time-grunt')(grunt);
    // load all grunt tasks
    require('load-grunt-tasks')(grunt);

    grunt.initConfig({

        // Watch Config
        watch: {
            client: {
                files: [ 'client/**/*.js' ],
                tasks: [ 'jshint' ]
            },
            express: {
                files:  [ 'app.js', 'routes/**.js', '!**/node_modules/**', '!Gruntfile.js' ],
                tasks:  [ 'jshint', 'express:dev' ],
                options: {
                    nospawn: true // Without this option specified express won't be reloaded
                }
            },
        },

        // Hint Config
        jshint: {
            options: {
                jshintrc: '.jshintrc',
                force: true
            },
            all: [
                'Gruntfile.js',
                'app.js',
                'routes/**/*.js',
                'client/**/*.js'
            ]
        },

        // Express Config
        express: {
            options: {
              // Override defaults here
            },
            dev: {
                options: {
                    script: 'app.js'
                }
            }
        },

        // Open Config
        open: {
            site: {
                path: 'http://localhost:3000',
                app: 'Google Chrome'
            },
            editor: {
                path: './',
                app: 'WebStorm'
            },
        }

    });

    // Register Tasks
    // Workon
    grunt.registerTask('workon', 'Start working on this project.', [
        'jshint',
        'express:dev',
        'open:site',
        'watch'
    ]);


    // Restart
    grunt.registerTask('restart', 'Restart the server.', [
        'express:dev',
        'watch'
    ]);
};
