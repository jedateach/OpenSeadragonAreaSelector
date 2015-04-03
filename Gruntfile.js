module.exports = function(grunt) {

    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks("grunt-contrib-clean");
    grunt.loadNpmTasks("grunt-contrib-jshint");
    grunt.loadNpmTasks("grunt-contrib-concat");
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks("grunt-git-describe");
    grunt.loadNpmTasks('grunt-jsdoc');

    var packageJson = grunt.file.readJSON("package.json"),
        docsGlobals = '../OpenSeadragonImaging/docs/docs-globals.js',
        distributionName = 'openseadragon-areaselector.js',
        minifiedName = 'openseadragon-areaselector.min.js',
        srcDir = 'src/',
        buildDir = 'build/',
        builtDir = buildDir + 'openseadragonareaselector/',
        docsDir = buildDir + 'docs/',
        publishDir = '../../jedateach.github.io/builds/',
        distribution = builtDir + distributionName,
        minified = builtDir + minifiedName,
        sources = [
            srcDir + 'areaselector.js'
        ];

    grunt.initConfig({
        pkg: packageJson,
        areaselectorVersion: {
            versionStr: packageJson.version,
            major:      parseInt(packageJson.version.split('.')[0], 10),
            minor:      parseInt(packageJson.version.split('.')[1], 10),
            revision:   parseInt(packageJson.version.split('.')[2], 10)
        },
        "git-describe": {
            build: {
                options: {
                    //prop: "gitInfo" //not working?
                }
            }
        },
        clean: {
            build: {
                src: [builtDir]
            },
            doc: {
                src: [docsDir]
            }
        },
        jshint: {
            options: {
                jshintrc: '.jshintrc'
            },
            beforeconcat: sources,
            afterconcat: [distribution]
        },
        concat: {
            options: {
                banner: '//! <%= pkg.name %> <%= pkg.version %>\n'
                      + '//! Build date: <%= grunt.template.today("yyyy-mm-dd") %>\n'
                      //+ '//! Git commit: <%= gitInfo %>\n'
                      + '//! https://github.com/jedateach/OpenSeadragonAreaSelector\n',
                process: true
            },
            dist: {
                src:  ['<banner>'].concat(sources),
                dest: distribution
            }
        },
        uglify: {
            options: {
                preserveComments: 'some'
            },
            build: {
                src: distribution,
                dest: minified
            }
        },
        watch: {
            files: ['Gruntfile.js', srcDir + '*.js'],
            tasks: ['build']
            //options: {
            //    event: ['added', 'deleted'], //'all', 'changed', 'added', 'deleted'
            //}
        },
        jsdoc : {
            dist : {
                src: [docsGlobals, distribution],//, 'README.md'
                options: {
                    destination: docsDir,
                    //template: "node_modules/docstrap/template",
                    configure: 'doc-conf.json'
                }
            }
        }
    });

    // Copies built source to demo site folder
    grunt.registerTask('publish', function() {
        grunt.file.copy(distribution, publishDir + distributionName);
        grunt.file.copy(minified, publishDir + minifiedName);
    });

    // Build task(s).
    grunt.registerTask('build', ['clean:build', 'jshint:beforeconcat', 'git-describe', 'concat', 'jshint:afterconcat', 'uglify']);

    // Documentation task(s).
    grunt.registerTask('doc', ['clean:doc', 'jsdoc']);

    // Default task(s).
    grunt.registerTask('default', ['build']);

};