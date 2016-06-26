module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    concat: {
      options: {
        separator: ';'
      },
      dist: {
        src: 'src/scripts/*.js',
        dest: 'public/dist/build.js'
      }
    },

    uglify: {

      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\n'
      },
      dist: {
        files: {
          'public/dist/build.min.js': ['<%= concat.dist.dest %>']
        }
      }
    },

    cssmin: {

      options: {
        keepSpecialComments: 0
      },
      dist: {
        files: {
          'public/dist/style.min.css': 'src/styles/style.css'
        }
      }
    },

    watch: {
      javascript: {
        files: 'src/scripts/*.js',
        tasks: ['concat', 'uglify']
      },
      css: {
        files: 'src/styles/style.css',
        tasks: 'cssmin'
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-cssmin');

  ////////////////////////////////////////////////////
  // Main grunt tasks
  ////////////////////////////////////////////////////

  grunt.registerTask('build', [
    'concat',
    'uglify',
    'cssmin'
  ]);

  grunt.registerTask('dev', function (target) {
    grunt.task.run(['build']);
    grunt.task.run([ 'watch' ]);
  });

};