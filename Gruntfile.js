/*jshint node: true */
/*jshint laxcomma: true */

var request = require('request');
var cheerio = require('cheerio');
var fs = require('fs');

module.exports = function(grunt) {

	grunt.initConfig({

    clean: {
      dist: ['dist', 'build'],
      build: ['build']
    },

    coffee: {
      compile: {
        files: {
          'build/jquery.floatThead.dataAPI.js': 'jquery.floatThead.dataAPI.coffee'
        }
      }
    },



    concat: {
      options: {
        stripBanners: false
      },
      full: {
        src: [
          'jquery.floatThead.js',
          'jquery.floatThead._.js',
          'build/jquery.floatThead.dataAPI.js'
        ],
        dest: 'build/jquery.floatThead.js'
      }
    },

    copy: {
      slim: {
        src:  'jquery.floatThead.js',
        dest: 'build/jquery.floatThead-slim.js'
      },
      slimDist: {
        src:  'jquery.floatThead.js',
        dest: 'dist/jquery.floatThead-slim.js'
      },
      full: {
        src: 'build/jquery.floatThead.js',
        dest: 'dist/jquery.floatThead.js'
      }
    },

		uglify: {
			options: {
				mangle: true,
				compress: true,
				report: true,
				preserveComments: 'some'
			},
			floatTheadSlim: {
				src: ['build/jquery.floatThead-slim.js'],
				dest: 'dist/jquery.floatThead-slim.min.js'
			},
      floatThead: {
				src: ['build/jquery.floatThead.js'],
				dest: 'dist/jquery.floatThead.min.js'
			}
		},

		jekyll: {
			docs: {}
		},


		watch: {
			lib: {
				files: ['./lib/**/*', './*.js', './*.coffee', '**/*.less'],
				tasks: ['build', 'jekyll']
			},
			html: {
				files: ['./*.html', './examples/*.html', './tests/*.html', './_includes/*.html', './_layouts/*.html'],
				tasks: ['jekyll']
			}
		},

		bgShell: {
			jekyll: {
				bg: true,
				cmd: 'jekyll serve'
			}
		}
	});

  grunt.registerTask('jsfiddle', 'A sample task that logs stuff.', function(url, issue) {
    var done = this.async();
    if(arguments.length == 0){
      console.log('This task creates a test from a jsfiddle. To use: grunt jsfiddle:Gp3yV/13:56');
      console.log('Gp3yV/13  -> fiddle');
      console.log('56  -> issue');
      return done()
    }
    issue = issue || "rename-me";
    console.log("fiddle url:", "http://jsfiddle.net/"+url+"/show/");
    console.log("issue:", issue);
    request("http://jsfiddle.net/"+url+"/show/", function(err, resp, body) {
      if (err)
        throw err;
      var $ = cheerio.load(body);
      var css = $('style').text();
      var js =  $('script:last-child').text();
      var html = $('body').html();
      var out = "---\n\
layout: lite\n\
base_url: './../..'\n\
slug: tests\n\
bootstrap: false\n\
desc: 'TODO description\n'\
issue: "+issue+"\n\
---\n\n";
      out += "<style>"+css+"</style>\n\n\n<script type='text/javascript'>"+js+"</script>\n\n\n\<div id='jsfiddle'>"+html+"</div>"
      fs.writeFileSync('./tests/issue-'+issue+'.html', out);
      console.log('created test html');
      done()
    });
  });

	grunt.loadNpmTasks('grunt-contrib-coffee');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-jekyll');
	grunt.loadNpmTasks('grunt-bg-shell');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-clean');

  grunt.registerTask('build', ['coffee', 'concat', 'copy',  'uglify']);

	// For development - run a server and watch for changes
	grunt.registerTask('sandbox', ['clean:dist', 'build', 'bgShell:jekyll', 'watch']);

	// Run jekyll serve without a build
	grunt.registerTask('serve', ['bgShell:jekyll', 'watch']);

	grunt.registerTask('default', function(){
		console.log("");
		console.log("jquery.floatThead.js by Misha Koryak");
		console.log("------------------------------------");
		console.log("To run project in sandbox mode (with file watcher and server) run: grunt sandbox");
		console.log("The sandbox mode requires jekyll - http://jekyllrb.com/");
	})
}
