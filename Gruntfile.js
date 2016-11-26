'use strict';

module.exports = function(grunt) {

  grunt.initConfig({

    pkg: grunt.file.readJSON('package.json'),

    compass: {
      min: {
        options: {              // Target options
          sassDir: 'sass',
          cssDir: 'css',
          environment: 'production',
          outputStyle: 'compressed',
          imagesDir: './img',
          relativeAssets: true
        }
      },
      full: {
        options: {              // Target options
          sassDir: 'sass',
          outputStyle: 'nested',
          cssDir: 'css',
          imagesDir: './img',
          relativeAssets: true
        }
      }
    },

    // Reads HTML for usemin blocks to enable smart builds that automatically
    // concat, minify and revision files. Creates configurations in memory so
    // additional tasks can operate on them
    useminPrepare: {
        options: {
            dest: './deploy',
            root: './'
        },
        html: 'twigs/index.html.twig'
    },

    // Performs rewrites based on rev and the useminPrepare configuration
    usemin: {
        html: ['./deploy/twigs/index.html.twig']
    },

    // Watches files for changes and runs tasks based on the changed files
    watch: {
        compass: {
            files: ['sass/{,*/}*.{scss,sass}'],
            tasks: ['compassfull']
        }
    },

    concat: {
      options: {
        separator: ';',
      }
    },

    imagemin: {                          // Task
      dynamic: {                         // Another target
        files: [{
          expand: true,                  // Enable dynamic expansion
          src: ['img/{,*/}{,*/}*.{png,jpg,gif}'],   // Actual patterns to match
          dest: './deploy/'                  // Destination path prefix
        }]
      }
    },

    copy: {
      main: {
        files: [
          {src: [
            '.htaccess',
            './src/**',
            './font/**',
            './dataOK/**',
            './twigs/**',
            './vendor/**',
            './app/**',
            './index.php',
            './settings.yml'],
            dest: './deploy/', filter: 'isFile'},
        ]
      },
      second: {
        files: [
          {src: [
            '.htaccess',
            './font/**',
            './dataOK/**',
            './twigs/**',
            './app/**',
            './index.php',
            './settings.yml'],
            dest: './deploy/', filter: 'isFile'},
        ]
      },
    },

    replace: {

      php: {
        src: './deploy/settings.yml',
        overwrite: true,
        replacements: [
          {from: 'base_url: /', to: 'base_url: /'},
          {from: 'debug: true', to: 'debug: false'}
        ]
      },

    }

  });

  // Default task(s).
  grunt.registerTask('compileIni', [], function() {

      grunt.loadNpmTasks('grunt-contrib-compass');
      grunt.loadNpmTasks('grunt-usemin');
      grunt.loadNpmTasks('grunt-contrib-concat');
      grunt.loadNpmTasks('grunt-contrib-uglify');
      grunt.loadNpmTasks('grunt-contrib-copy');
      grunt.loadNpmTasks('grunt-contrib-cssmin');
      grunt.loadNpmTasks('grunt-text-replace');
      grunt.loadNpmTasks('grunt-usemin');

      grunt.task.run('compass:min', 'useminPrepare', 'concat',
          'uglify', 'copy:main', 'cssmin', 'replace', 'usemin');

  });
  // Default task(s).
  grunt.registerTask('compile', [], function() {

      grunt.loadNpmTasks('grunt-contrib-compass');
      grunt.loadNpmTasks('grunt-usemin');
      grunt.loadNpmTasks('grunt-contrib-concat');
      grunt.loadNpmTasks('grunt-contrib-uglify');
      grunt.loadNpmTasks('grunt-contrib-copy');
      grunt.loadNpmTasks('grunt-contrib-cssmin');
      grunt.loadNpmTasks('grunt-text-replace');
      grunt.loadNpmTasks('grunt-usemin');

      grunt.task.run('compass:min', 'useminPrepare', 'concat',
          'uglify', 'copy:second', 'cssmin', 'replace', 'usemin');

  });

  grunt.registerTask('compileimg', [], function() {

      grunt.loadNpmTasks('grunt-contrib-compass');
      grunt.loadNpmTasks('grunt-usemin');
      grunt.loadNpmTasks('grunt-contrib-concat');
      grunt.loadNpmTasks('grunt-contrib-uglify');
      grunt.loadNpmTasks('grunt-contrib-imagemin');
      grunt.loadNpmTasks('grunt-contrib-copy');
      grunt.loadNpmTasks('grunt-contrib-cssmin');
      grunt.loadNpmTasks('grunt-text-replace');
      grunt.loadNpmTasks('grunt-usemin');

      grunt.task.run('compass:min', 'useminPrepare', 'concat',
          'uglify', 'imagemin', 'copy', 'cssmin', 'replace', 'usemin');

  });

  grunt.registerTask('watch', [], function() {

      grunt.loadNpmTasks('grunt-contrib-watch');
      grunt.loadNpmTasks('grunt-contrib-compass');
      grunt.task.run('compassfull');
      grunt.task.run('watch');

  });

  grunt.registerTask('compassfull', [], function() {

      grunt.loadNpmTasks('grunt-contrib-compass');
      grunt.task.run('compass:full');
  });

  grunt.registerTask('sass', [], function() {

      grunt.loadNpmTasks('grunt-contrib-compass');
      grunt.task.run('compass:full');
  });
};
