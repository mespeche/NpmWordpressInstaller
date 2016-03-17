var config  = require('./config.json'),
    prompt  = require('prompt'),
    colors  = require('colors/safe'),
    mkdirp  = require('mkdirp'),
    WP      = require('wp-cli');

welcome();

prompt.start();
prompt.message = '';

prompt.get(config.initVars, function (err, result) {
  if (err) {
    error(err);
  } else {
    mkdirp(result.directory, function (err) {
      if (err) {
        error(err);
      }
      else {
        succes('Directory ' + result.directory + ' successfully created.');

        WP.discover({ path: result.directory },function(WP){
          wpDownload(WP, result);
        });
      }
    });
  }
});

function welcome() {
  console.log(colors.cyan('************************************************'));
  console.log(colors.cyan('*** Welcome to the NPM Wordpress installer ! ***'));
  console.log(colors.cyan('************************************************'));
}

function wpDownload(WP, options) {
  WP.core.download({ path: options.directory, locale: options.locale }, function(err, info){
    if (err) {
      error(err);
    } else {
      succes(info);

      console.log(colors.cyan('Now lets set up your Wordpress environment.'));
      prompt.get(config.configVars, function(err, result){
        wpConfig(WP, result);
      });
    }
  });
}

function wpConfig(WP, options) {
  WP.core.config(options, function(err, info){
    if (err) {
      error(err);
    } else {
      succes(info);

      wpDbCreate(WP);
    }
  });
}

function wpDbCreate(WP) {
  WP.db.create(function(err, info){
    if (err) {
      error(err);
    } else {
      succes(info);

      console.log(colors.cyan('Last step, create your admin account.'));
      prompt.get(config.installVars, function(err, result){
        wpInstall(WP, result);
      });
    }
  });
}

function wpInstall(WP, options) {
  WP.core.install(options, function(err, info){
    if (err) {
      error(err);
    } else {
      succes(info);
    }
  });
}

function error(msg) {
  console.log(colors.red(msg));
}

function succes(msg) {
  console.log(colors.green(msg));
}
