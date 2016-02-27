var prompt  = require('prompt'),
    colors  = require('colors/safe'),
    mkdirp  = require('mkdirp'),
    WP      = require('wp-cli');

var initVars = {
  properties: {
    directory: {
      message: 'Where do you want to install your new Wordpress project ?',
      required: true,
      default: 'wordpress'
    },
    locale: {
      message: 'Select which language you want to download',
      require: true,
      default: 'en_US'
    }
  }
};

var configVars = {
  properties: {
    dbname : {
      message: 'Database',
      required: true,
      default: 'wordpress'
    },
    dbuser : {
      message: 'User',
      required: true,
      default: 'root'
    },
    dbpass : {
      message: 'Password',
      hidden: true,
      replace: '*'
    },
    dbhost: {
      message: 'Host',
      required: true,
      default: 'localhost'
    },
    dbprefix: {
      message: 'Prefix'
    },
    dbcharset : {
      message: 'Charset',
      default: 'utf8'
    }
  }
};

var installVars = {
  properties : {
    url : {
      message: 'Your website url',
      required: true
    },
    title : {
      message: 'Your website title',
      required: true
    },
    admin_user : {
      message: 'Your admin username',
      required: true
    },
    admin_password : {
      message: 'Your admin password',
      required: true,
      hidden: true,
      replace: '*'
    },
    admin_email : {
      message: 'Your admin email address',
      required: true
    }
  }
};

welcome();

prompt.start();
prompt.message = '';

prompt.get(initVars, function (err, result) {
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
      prompt.get(configVars, function(err, result){
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
      prompt.get(installVars, function(err, result){
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
