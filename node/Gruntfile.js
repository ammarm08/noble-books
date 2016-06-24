module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    concat: {
      options: {
        separator: ';'
      },
      dist: {
        src: [
        'src/vendor/jquery/dist/jquery.min.js', 
        'src/vendor/bootstrap/dist/js/bootstrap.min.js',
        'src/scripts/*.js'
        ],
        dest: 'src/scripts/build.js'
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
        files: [
        'src/vendor/jquery/dist/jquery.min.js', 
        'src/vendor/bootstrap/dist/js/bootstrap.min.js', 
        'src/scripts/*.js'
        ],
        tasks: ['concat', 'uglify']
      },
      css: {
        files: 'src/styles/style.css',
        tasks: 'cssmin'
      }
    },

    nodemon: {
      dev: {
        script: './server.js'
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-nodemon');

  ////////////////////////////////////////////////////
  // Main grunt tasks
  ////////////////////////////////////////////////////

  grunt.registerTask('build', [
    'concat',
    'uglify',
    'cssmin'
  ]);

  // Running nodejs in a different process and displaying output on the main console
  grunt.registerTask('dev', function (target) {
    var nodemon = grunt.util.spawn({
         cmd: 'grunt',
         grunt: true,
         args: 'nodemon'
    });

    nodemon.stdout.pipe(process.stdout);
    nodemon.stderr.pipe(process.stderr);
    grunt.task.run(['build']);
    grunt.task.run([ 'watch' ]);
  });

};