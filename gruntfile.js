module.exports = function(grunt) {
  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    qunit: {
      all: 'test/**/*.html'
    }
  });

  // Load task plugins.
  grunt.loadNpmTasks('grunt-contrib-qunit');

  // Register default task(s).
  grunt.registerTask('default', [ 'test' ]);

  // Register testing task(s).
  grunt.registerTask('test', [ 'qunit' ]);
};
