// Karma configuration
// http://karma-runner.github.io/0.10/config/configuration-file.html

module.exports = function(config) {
  config.set({
    // base path, that will be used to resolve files and exclude
    basePath: '',

    // testing framework to use (jasmine/mocha/qunit/...)
    frameworks: ['jasmine','requirejs','express-http-server'],

    // list of files / patterns to load in the browser
    files: [
      //modules loaded
      //'node_modules/requirejs/require.js',
      //'node_modules/express/index.js',
      //files to test    
      'server/**/*.js',  
      //TESTING FILES
      'test/practice.spec.js'
    ],

    // list of files / patterns to exclude
    exclude: [
    ],

    logger: [{tpye:'console'}],

    reporter: ['progress'],

    // web server port
    port: 9876,

    // level of logging
    // possible values: LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
    logLevel: config.LOG_DEBUG,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: false,

    // preprocessors: {
    //     'server/**/*.js' : ['coverage']
    // },

    coverageReporter: {
        type: 'html',
        dir: 'results/coverage/'
    },

    caputerTimeout: 20000,

    // Start these browsers, currently available:
    // - Chrome
    // - ChromeCanary
    // - Firefox
    // - Opera
    // - Safari (only Mac)
    // - PhantomJS
    // - IE (only Windows)
    browsers: ['PhantomJS'],

    reportSlowerThan: 500,

    // Continuous Integration mode
    // if true, it capture browsers, run tests and exit
    singleRun: true,

    plugins: [
      'karma-requirejs',
      'karma-coverage',
      'karma-jasmine',
      'karma-phantomjs-launcher',
      'karma-chrome-launcher',
      'karma-express-http-server'
    ]
  });
};