var config  = require('./config.json'),
    Class   = require('js-class'),
    colors  = require('colors/safe'),
    mkdirp  = require('mkdirp'),
    WP      = require('wp-cli');



var WPInstaller = Class({

  /**
  * Constructor
  * @var config Application configuration stored in json file
  */
  constructor: function (config) {
    prompt.start();
    prompt.message = '';

    this.config = config;
    this.wp = null;

    this.welcome();
    this.init();
  },

  /**
  * Display welcome message
  */
  welcome: function () {
    this.alert('info', '************************************************');
    this.alert('info', '*** Welcome to the NPM Wordpress installer ! ***');
    this.alert('info', '************************************************');
  },

  /**
  * Asks basic informations to init a new project
  */
  init: function() {
    var self = this;

    prompt.get(self.getConfig('initVars'), function (err, result) {
      if (err) {
        self.alert('error', err);
      } else {
        self.createFolder(result);
      }
    });
  },

  /**
  * Create the new project folder & call WP download
  * @var result Result of prompt answers
  */
  createFolder: function(result) {
    var self = this;

    mkdirp(result.directory, function (err) {
      if (err) {
        self.alert('error', err);
      }
      else {
        self.alert('success', 'Directory ' + result.directory + ' successfully created.');

        WP.discover({ path: result.directory },function(WP){
          self.setWP(WP);
          self.download(result);
        });
      }
    });
  },

  /**
  * Download the WP package
  * @var options Result of prompt answers
  */
  download: function(options) {
    var self = this;

    this.getWP().core.download({ path: options.directory, locale: options.locale }, function(err, info){
      if (err) {
        self.alert('error', err);
      } else {
        self.alert('success', info);
        self.alert('info', 'Now lets set up your Wordpress environment.');

        prompt.get(self.getConfig('configVars'), function(err, result){
          self.configure(result);
        });
      }
    });
  },

  /**
  * Create the wp-config.php file
  * @var options Result of prompt answers
  */
  configure: function(options) {
    var self = this;

    this.getWP().core.config(options, function(err, info){
      if (err) {
        self.alert('error', err);
      } else {
        self.alert('success', info);

        self.dbCreate();
      }
    });
  },

  /**
  * Create the new database
  */
  dbCreate: function() {
    var self = this;

    this.getWP().db.create(function(err, info){
      if (err) {
        self.alert('error', err);
      } else {
        self.alert('success', info);

        self.alert('info', 'Last step, create your admin account.');

        prompt.get(self.getConfig('installVars'), function(err, result){
          self.install(result);
        });
      }
    });
  },

  /**
  * Create the admin account
  * @var options Result of prompt answers
  */
  install: function(options) {
    var self = this;

    this.getWP().core.install(options, function(err, info){
      if (err) {
        self.alert('error', err);
      } else {
        self.alert('success', info);
      }
    });
  },

  /**
  * Set the wordpress instance inside var
  * @var wp Wordpress instance
  */
  setWP: function(wp) {
    this.wp = wp;
  },

  /**
  * Get a config var
  * @var name Name of the config var
  * @return Return the config var
  */
  getConfig: function(name) {
    return this.config[name];
  },

  /**
  * Get the Wordpress instance
  * @return Return the Wordpress instance
  */
  getWP: function() {
    return this.wp;
  },

  /**
  * Display console message
  * @var type Type of message
  * @var message Text to display
  */
  alert: function(type, message) {
    if (type === 'error') {
      console.log(colors.red(message));
    } else if (type === 'success') {
      console.log(colors.green(message));
    } else if (type === 'info') {
      console.log(colors.cyan(message));
    }
  }
});

//var app = new WPInstaller(config);
