var config    = require('./config.json'),
    _         = require('underscore'),
    Class     = require('js-class'),
    inquirer  = require('inquirer'),
    colors    = require('colors/safe'),
    mkdirp    = require('mkdirp'),
    WP        = require('wp-cli');

var WPInstaller = Class({

  /**
  * Constructor
  * @var config Application configuration stored in json file
  */
  constructor: function (config) {
    this.config = config;
    this.wp = null;
    this.directory = null;

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

    inquirer.prompt(self.getConfig('initVars'), function(answers){
      self.createFolder(answers);
    });
  },

  /**
  * Create the new project folder & call WP download
  * @var result Result of prompt answers
  */
  createFolder: function(answers) {
    var self = this;

    mkdirp(answers.directory, function (err) {
      if (err) {
        self.alert('error', err);
      }
      else {
        self.alert('success', 'Directory ' + answers.directory + ' successfully created.');
        self.directory = answers.directory;

        WP.discover({ path: answers.directory },function(WP){
          self.setWP(WP);
          self.download(answers);
        });
      }
    });
  },

  /**
  * Download the WP package
  * @var options Result of prompt answers
  */
  download: function(answers) {
    var self = this;

    this.getWP().core.download({ path: answers.directory, locale: answers.locale }, function(err, info){
      if (err) {
        self.alert('error', err);
      } else {
        self.alert('success', info);
        self.alert('info', 'Now lets set up your Wordpress environment.');

        inquirer.prompt(self.getConfig('configVars'), function(answers){
          self.configure(answers);
        });
      }
    });
  },

  /**
  * Create the wp-config.php file
  * @var options Result of prompt answers
  */
  configure: function(answers) {
    var self = this;

    this.getWP().core.config(answers, function(err, info){
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

        inquirer.prompt(self.getConfig('installVars'), function(answers){
          self.install(answers);
        });
      }
    });
  },

  /**
  * Create the admin account
  * @var options Result of prompt answers
  */
  install: function(answers) {
    var self = this;

    this.getWP().core.install(answers, function(err, info){
      if (err) {
        self.alert('error', err);
      } else {
        self.alert('success', info);
      }

      inquirer.prompt(self.getConfig('installPluginsQuestion'), function(answers){
        if (answers.installPlugins === true) {
          self.selectPlugins();
        } else {
          self.alert('success', 'Your installation is finished, thanks !');
        }
      });
    });
  },

  selectPlugins: function() {
    var self = this;

    inquirer.prompt(self.getConfig('installPluginsList'), function(answers){
      _.each(answers.pluginsList, function(plugin){

          self.getWP().plugin.install(plugin, '--path="' + self.directory + '"', function(err, info){
            if (err) {
              self.alert('error', err);
            } else {
              self.alert('success', info);
            }
          });

      });
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

var app = new WPInstaller(config);
