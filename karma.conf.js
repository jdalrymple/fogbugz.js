module.exports = function(config) {
	config.set({
		// base path, that will be used to resolve files and exclude
		basePath: '',

		// frameworks to use
		frameworks: ['mocha'],

		preprocessors: {
			'fogbugz.js': 'coverage',
			'test/*.coffee': 'coffee'
		},

		// list of files / patterns to load in the browser
		files: [
			// TODO install jquery locally
			'http://code.jquery.com/jquery-2.0.3.js',
			'node_modules/jquery-xml2json/src/xml2json.js',
			'node_modules/expect.js/index.js',
			'node_modules/underscore/underscore.js',
			'karma-require.js',
			'fogbugz.js',
			'test/*.coffee'
		],

		// list of files to exclude
		exclude: [],

		// test results reporter to use
		// possible values: 'dots', 'progress', 'junit', 'growl', 'coverage'
		reporters: ['dots', 'coverage'],

		coverageReporter: {
			type: 'html',
			dir: '.coverage'
		},

		// web server port
		port: 9876,

		// enable / disable colors in the output (reporters and logs)
		colors: true,

		// level of logging
		// possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
		logLevel: config.LOG_INFO,

		// enable / disable watching file and executing tests whenever any file changes
		autoWatch: false,

		// Start these browsers, currently available:
		// - Chrome
		// - ChromeCanary
		// - Firefox
		// - Opera
		// - Safari (only Mac)
		// - PhantomJS
		// - IE (only Windows)
		browsers: ['PhantomJS'],

		// If browser does not capture in given timeout [ms], kill it
		captureTimeout: 60000,

		// Continuous Integration mode
		// if true, it capture browsers, run tests and exit
		singleRun: false
	});
};
