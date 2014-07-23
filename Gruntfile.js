/**
 * Gruntfile for compiling theme_bootstrap .less files.
 *
 * This file configures tasks to be run by Grunt
 * http://gruntjs.com/ for the current theme.
 *
 *
 * Requirements:
 * -------------
 * nodejs, npm, grunt-cli.
 *
 * Installation:
 * -------------
 * node and npm: instructions at http://nodejs.org/
 *
 * grunt-cli: `[sudo] npm install -g grunt-cli`
 *
 * node dependencies: run `npm install` in the root directory.
 *
 *
 * Usage:
 * ------
 * Call tasks from the theme root directory. Default behaviour
 * (calling only `grunt`) is to run the watch task detailed below.
 *
 *
 * Porcelain tasks:
 * ----------------
 * The nice user interface intended for everyday use. Provide a
 * high level of automation and convenience for specific use-cases.
 *
 * grunt watch   Watch the less directory (and all subdirectories)
 *               for changes to *.less files then on detection
 *               run 'grunt compile'
 *
 *               Options:
 *
 *               --dirroot=<path>  Optional. Explicitly define the
 *                                 path to your Moodle root directory
 *                                 when your theme is not in the
 *                                 standard location.
 * grunt compile Run the .less files through the compiler, create the
 *               RTL version of the output, then run decache so that
 *               the results can be seen on the next page load.
 *
 *               Options:
 *
 *               --dirroot=<path>  Optional. Explicitly define the
 *                                 path to your Moodle root directory
 *                                 when your theme is not in the
 *                                 standard location.
 *
 * grunt swatch  Task for working with bootswatch files. Expects a
 *               convention to be followed - bootswatch files are
 *               contained within a directory providing the name
 *               by which the swatch is identified. By default the
 *               directory these should be placed in is less/bootswatch
 *               however the user may optionally override this.
 *               e.g. swatch files contained within a directory
 *               located at less/bootswatch/squib will be associated
 *               with the swatch name 'squib'.
 *
 *               Switches the current bootswatch files compiled with
 *               the theme to those of a given bootswatch, recompiles
 *               less and clears the theme cache.
 *
 *               Options:
 *
 *               --name=<swatchname>    Required. Name (as defined by
 *                                      the convention) of the swatch
 *                                      to activate.
 *
 *               --swatches-dir=<path>  Optional. Explicitly define
 *                                      the path to the directory
 *                                      containing your bootswatches
 *                                      (default is less/bootswatch).
 *
 *               --vars-only            Optional. Copy the swatch's
 *                                      variables.less file only
 *                                      and empty custom-bootswatch.less
 *                                      Due to issues with grunt's
 *                                      handling of boolean options
 *                                      if not explicitly set e.g.
 *                                      `--vars-only=true` this option
 *                                      should be passed last.
 *
 *
 *
 * Plumbing tasks & targets:
 * -------------------------
 * Lower level tasks encapsulating a specific piece of functionality
 * but usually only useful when called in combination with another.
 *
 * grunt less         Compile all less files.
 *
 * grunt less:moodle  Compile Moodle less files only.
 *
 * grunt less:editor  Compile editor less files only.
 *
 * grunt decache      Clears the Moodle theme cache.
 *
 *                    Options:
 *
 *                    --dirroot=<path>  Optional. Explicitly define
 *                                      the path to your Moodle root
 *                                      directory when your theme is
 *                                      not in the standard location.
 *
 * grunt swatch  Switch the theme less/bootswatch/custom-bootswatch.less
 *                   and less/bootswatch/custom-variables.less files for
 *                   those of a given bootswatch theme using convention
 *                   described in swatch task.
 *
 *                   Options:
 *
 *                   --name=<swatchname>    Required. Name (as defined by
 *                                          the convention) of the swatch
 *                                          to activate.
 *
 *                   --swatches-dir=<path>  Optional. Explicitly define
 *                                          the path to the directory
 *                                          containing your bootswatches
 *                                          (default is less/bootswatch).
 *
 *                   --vars-only            Optional. Copy the swatch's
 *                                          variables.less file only
 *                                          and empty custom-bootswatch.less
 *                                          Due to issues with grunt's
 *                                          handling of boolean options
 *                                          if not explicitly set e.g.
 *                                          `--vars-only=true` this option
 *                                          should be passed last.
 *
 *                   --none                 Optional. Reset bootswatch to
 *                                          plain Bootstrap (no swatch).
 *
 * grunt replace             Run all text replace tasks.
 *
 * grunt replace:rtl_images  Add _rtl to the filenames of certain images
 *                           that require flipping for use with RTL
 *                           languages.
 *
 * grunt replace:font_fix    Correct the format for the Moodle font
 *                           loader to pick up the Glyphicon font.
 *
 * grunt img                 Change the colour of the images by
 *                           text replacing #999 with a new hex colour.
 *                           Note this requires the SVGs to be #999 to
 *                           start with or the replace will do nothing
 *                           so should usually be preceded by copying
 *                           a fresh set of the original SVGs.
 *
 *                           Options:
 *
 *                           --svgcolour=<hexcolour> Hex colour to use for SVGs
 *
 * grunt cssflip    Create moodle-rtl.css by flipping the direction styles
 *                  in moodle.css.
 *
 *
 * @package theme
 * @subpackage bootstrap
 * @author Joby Harding www.iamjoby.com
 * @license http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

module.exports = function(grunt) {

    // Import modules.
    var path = require('path');

    // Theme Bootstrap constants.
    var LESSDIR         = 'less',
        BOOTSWATCHDIR   = path.join(LESSDIR, 'bootswatch'),
        BOOTSWATCHFILE  = path.join(BOOTSWATCHDIR, 'custom-bootswatch.less'),
        BOOTSWATCHVARS  = path.join(BOOTSWATCHDIR, 'custom-variables.less'),
        THEMEDIR        = path.basename(path.resolve('.'));

    // PHP strings for exec task.
    var moodleroot = path.dirname(path.dirname(__dirname)),
        configfile = '',
        decachephp = '',
        dirrootopt = grunt.option('dirroot') || process.env.MOODLE_DIR || '';

    // Allow user to explicitly define Moodle root dir.
    if ('' !== dirrootopt) {
        moodleroot = path.resolve(dirrootopt);
    }

    configfile = path.join(moodleroot, 'config.php');

    decachephp += 'define(\'CLI_SCRIPT\', true);';
    decachephp += 'require(\'' + configfile  + '\');';
    decachephp += 'theme_reset_all_caches();';

    var swatchname = grunt.option('name') || '';
    var defaultsvgcolour = {
        amelia: '#e8d069',
        bootstrap: '#428bca',
        classic: '#428bca',
        cerulean: '#2fa4e7',
        classic: '#428bca',
        cosmo: '#007fff',
        cupid: '#56caef',
        cyborg: '#2a9fd6',
        darkly: '#0ce3ac',
        flatly: '#18bc9c',
        journal: '#eb6864',
        lumen: '#158cba',
        readable: '#4582ec',
        shamrock: '#f8e33c',
        simplex: '#d9230f',
        slate: '#fff',
        spacelab: '#446e9b',
        superhero: '#df691a',
        united: '#dd4814',
        yeti: '#008cba',
    };
    var svgcolour = grunt.option('svgcolour') || defaultsvgcolour[swatchname] || '#999';

    grunt.initConfig({
        less: {
            // Compile moodle styles.
            moodle: {
                options: {
                    compress: false,
                    strictMath: true,
                    outputSourceFiles: true,
                    sourceMap: true,
                    sourceMapRootpath: '/theme/' + THEMEDIR,
                    sourceMapFilename: 'style/moodle.css'
                },
                src: 'less/moodle.less',
                dest: 'style/moodle.css'
            },
            // Compile editor styles.
            editor: {
                options: {
                    compress: false,
                    strictMath: true,
                    outputSourceFiles: true,
                    sourceMap: true,
                    sourceMapRootpath: '/theme/' + THEMEDIR,
                    sourceMapFilename: 'style/editor.css'
                },
                src: 'less/editor.less',
                dest: 'style/editor.css'
            }
        },
        autoprefixer: {
          options: {
            browsers: [
              'Android 2.3',
              'Android >= 4',
              'Chrome >= 20',
              'Firefox >= 24', // Firefox 24 is the latest ESR
              'Explorer >= 8',
              'iOS >= 6',
              'Opera >= 12',
              'Safari >= 6'
            ]
          },
          core: {
            options: {
              map: true
            },
            src: ['style/moodle.css', 'style/moodle-rtl.css', 'style/editor.css'],
          },
        },
        cssmin: {
            options: {
                compatibility: 'ie8',
                keepSpecialComments: '*',
                noAdvanced: true
            }, 
            core: {
                files: {
                    'style/moodle_min.css': 'style/moodle.css',
                    'style/editor_min.css': 'style/editor.css'
                }
            }
        },
        csscomb: {
            options: {
                config: 'less/bootstrap3/.csscomb.json'
            },
            dist: {
                expand: true,
                cwd: 'style/',
                src: ['moodle.css', 'editor.css'],
                dest: 'style/'
            }
        },
        exec: {
            decache: {
                cmd: 'php -r "' + decachephp + '"',
                callback: function(error, stdout, stderror) {
                    // exec will output error messages
                    // just add one to confirm success.
                    if (!error) {
                        grunt.log.writeln("Moodle theme cache reset.");
                    }
                }
            }
        },
        watch: {
            // Watch for any changes to less files and compile.
            files: ["less/**/*.less"],
            tasks: ["compile"],
            options: {
                spawn: false,
                livereload: true
            }
        },
        cssflip: {
            rtl: {
                src: 'style/moodle.css',
                dest: 'style/moodle-rtl.css'
            }
        },
        copy: {
            svg_core: {
                 expand: true,
                 cwd: 'pix_core_originals/',
                 src: '**',
                 dest: 'pix_core/',
            },
            svg_plugins: {
                 expand: true,
                 cwd: 'pix_plugins_originals/',
                 src: '**',
                 dest: 'pix_plugins/',
            }
        },
        replace: {
            rtl_images: {
                src: 'style/moodle-rtl.css',
                    overwrite: true,
                    replacements: [{
                        from: '[[pix:theme|fp/path_folder]]',
                        to: '[[pix:theme|fp/path_folder_rtl]]'
                    }, {
                        from: '[[pix:t/collapsed]]',
                        to: '[[pix:t/collapsed_rtl]]'
                    }, {
                        from: '[[pix:t/collapsed_empty]]',
                        to: '[[pix:t/collapsed_empty_rtl]]'
                    }, {
                        from: '[[pix:y/tn]]',
                        to: '[[pix:y/tn_rtl]]'
                    }, {
                        from: '[[pix:y/tp]]',
                        to: '[[pix:y/tp_rtl]]'
                    }, {
                        from: '[[pix:y/ln]]',
                        to: '[[pix:y/ln_rtl]]'
                    }, {
                        from: '[[pix:y/lp]]',
                        to: '[[pix:y/lp_rtl]]'
                    }]
            },
            svg_colours_core: {
                src: 'pix_core/**/*.svg',
                    overwrite: true,
                    replacements: [{
                        from: '#999',
                        to: svgcolour
                    }]
            },
            svg_colours_plugins: {
                src: 'pix_plugins/**/*.svg',
                    overwrite: true,
                    replacements: [{
                        from: '#999',
                        to: svgcolour
                    }]
            },
            font_fix: {
                src: 'style/moodle.css',
                    overwrite: true,
                    replacements: [{
                        from: 'glyphicons-halflings-regular.eot',
                        to: 'glyphicons-halflings-regular.eot]]',
                    }, {
                        from: 'glyphicons-halflings-regular.svg',
                        to: 'glyphicons-halflings-regular.svg]]',
                    }, {
                        from: 'glyphicons-halflings-regular.ttf',
                        to: 'glyphicons-halflings-regular.ttf]]',
                    }, {
                        from: 'glyphicons-halflings-regular.woff',
                        to: 'glyphicons-halflings-regular.woff]]',
                    }]
            },
            sourcemap: {
                src: ['style/moodle.css', 'style/moodle-rtl.css', 'style/editor.css'],
                    overwrite: true,
                    replacements: [{
                        from: 'sourceMappingURL=',
                        to: 'sourceMappingURL=/theme/'+ THEMEDIR + '/style/'
                    }]
            }
        },
        svg2png: {
            core_root: {
                files: [
                    // rasterize all SVG files in "pix_core/" and to "pix_core/"
                    { cwd: 'pix_core/', src: ['*.svg'], dest: 'pix_core/' }
                ]
            },
            core_a: {
                files: [
                    // rasterize all SVG files in "pix_core/a" and its subdirectories to "pix_core/a"
                    { cwd: 'pix_core/a/', src: ['**/*.svg'], dest: 'pix_core/a/' }
                ]
            },
            core_e: {
                files: [
                    // rasterize all SVG files in "pix_core/e" and its subdirectories to "pix_core/e"
                    { cwd: 'pix_core/e/', src: ['**/*.svg'], dest: 'pix_core/e/' }
                ]
            },
            core_g: {
                files: [
                    // rasterize all SVG files in "pix_core/g" and its subdirectories to "pix_core/g"
                    { cwd: 'pix_core/g/', src: ['**/*.svg'], dest: 'pix_core/g/' }
                ]
            },
            core_i: {
                files: [
                    // rasterize all SVG files in "pix_core/i" and its subdirectories to "pix_core/i"
                    { cwd: 'pix_core/i/', src: ['**/*.svg'], dest: 'pix_core/i/' }
                ]
            },
            core_t: {
                files: [
                    // rasterize all SVG files in "pix_core/t" and its subdirectories to "pix_core/t"
                    { cwd: 'pix_core/t/', src: ['**/*.svg'], dest: 'pix_core/t/' }
                ]
            },
            core_u: {
                files: [
                    // rasterize all SVG files in "pix_core/u" and its subdirectories to "pix_core/u"
                    { cwd: 'pix_core/u/', src: ['**/*.svg'], dest: 'pix_core/u/' }
                ]
            },
            plugins: {
                files: [
                    // rasterize all SVG files in "pix_plugins" and its subdirectories to "pix_plugins"
                    { cwd: 'pix_plugins/', src: ['**/*.svg'], dest: 'pix_plugins/' }
                ]
            }
        }
    });

    // Local task functions.
    var _bootswatch = function() {
        var swatchname = grunt.option('name') || '',
            swatchroot = grunt.option('swatches-dir') || '',
            varsonly   = grunt.option('vars-only'),
            noswatch   = grunt.option('none');


        // Reset bootwatches for default boootstrap.
        if (noswatch) {
            grunt.file.write(BOOTSWATCHFILE, '');
            grunt.file.write(BOOTSWATCHVARS, '');
            grunt.log.writeln('Cleared bootswatch.');
            return;
        }

        // Required option.
        if ('' === swatchname) {
            grunt.fail.fatal('You must provide a swatch name.');
        }

        var swatchpath = path.join(BOOTSWATCHDIR, swatchname);

        // Allow user to explicitly define source swatches dir.
        if ('' !== swatchroot) {
           swatchpath = path.resolve(swatchroot);
           swatchpath = path.join(swatchpath, swatchname);
        }

        var swatchless = path.join(swatchpath, 'bootswatch.less'),
            varsless   = path.join(swatchpath, 'variables.less'),
            message    = '';

        // Ensure the swatch directory exists.
        if (!grunt.file.isDir(swatchpath)) {
            message = "The swatch directory '" + swatchpath + "' ";
            message += 'does not exist or is not accessible.';
            grunt.fail.fatal(message);
        }

        // Ensure the bootswatch.less file exists.
        if (!varsonly) {
            if (!grunt.file.isFile(swatchless)) {
                message = "The required file '" + swatchless + "' ";
                message += 'does not exist or is not accessible.';
                grunt.fail.fatal(message);
            }
        } else {
            grunt.file.write(BOOTSWATCHFILE, '');
        }

        // Ensure the variables.less file exists.
        if (!grunt.file.isFile(varsless)) {
            message = "The required file '" + varsless + "' ";
            message += 'does not exist or is not accessible.';
            grunt.fail.fatal(message);
        }

        // Copy in new swatch files.
        if (!varsonly) {
            grunt.file.copy(swatchless, BOOTSWATCHFILE);
        }
        grunt.file.copy(varsless, BOOTSWATCHVARS);
        grunt.log.writeln('Swatch copied.');

    };

    // Load contrib tasks.
    grunt.loadNpmTasks("grunt-autoprefixer");
    grunt.loadNpmTasks("grunt-contrib-less");
    grunt.loadNpmTasks("grunt-contrib-watch");
    grunt.loadNpmTasks("grunt-exec");
    grunt.loadNpmTasks("grunt-text-replace");
    grunt.loadNpmTasks("grunt-css-flip");
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-csscomb');
    grunt.loadNpmTasks('grunt-svg2png');

    // Register tasks.
    grunt.registerTask("default", ["watch"]);
    grunt.registerTask("decache", ["exec:decache"]);

    grunt.registerTask("bootswatch", _bootswatch);
    grunt.registerTask("compile", ["less", "replace:font_fix", "cssflip", "replace:rtl_images", "autoprefixer", 'csscomb', 'cssmin', "replace:sourcemap", "decache"]);
    grunt.registerTask("swatch", ["bootswatch", "img", "compile"]);
    grunt.registerTask("svg2png:core", ["svg2png:core_root", "svg2png:core_a", "svg2png:core_e", "svg2png:core_g", "svg2png:core_i", "svg2png:core_t", "svg2png:core_u"]);
    grunt.registerTask("img", ["copy:svg_core", "copy:svg_plugins", "replace:svg_colours_core", "replace:svg_colours_plugins", "svg2png:core", "svg2png:plugins"]);
};
