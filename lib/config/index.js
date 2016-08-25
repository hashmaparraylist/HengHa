// Require Module
let fs = require('fs');
let path = require('path');
let async = require('async');

let _conf = {
  data: {
    file: '/usr/local/var/HengHa/data.json'
  },
  gateway: {
    port: 1981,
    logger: {
      level: 'debug'
    }
  },
  admin: {
    port: 2016,
    authorization: {
      user: 'admin',
      password: 'admin'
    },
    logger: {
      level: 'debug'
    }
  }
}

// Export module
module.exports = {
  defaultConfig: _conf,
  getConfig: (customConfigFile) => {
    // If custom config file is not specified
    if (customConfigFile.length === 0) {
      return _conf;
    }
    // Resolve custom config file path
    let filePath = path.resolve(__dirname, customConfigFile);

    async.waterfall([(callback) => {
      // Check custom config file is exists
      fs.access(filePath, fs.F_OK, callback);
    }, (callback) => {
      // Load custom config file
      fs.readFile(filePath, callback);
    }, (contents, callback) => {
      // Parse custom config file's content to JSON
      let customConfig = JSON.Parse(contents.toString()); 
      // Merge custom configuration and default configuration
      callback(null, _.assignIn({}, _conf, customConfig));
    }, (config, callback) => {

      // Resolve data file
      config.data.file = path.resolve(__dirname, config.data.file);

      // Get dirname for datafile
      let dataDirname = path.dirname(config.data.file);

      // Check datafile path is exists
      fs.stat(dataDirname, (error, stats) => {
        callback(error, config);
      });
    }, (config, callback) => {
      // Check datafile is exists
      fs.access(config.data.file, fs.F_OK, (error) => {
        if (error) {
          fs.writeFile(config.data.file, '', (error) => {
            callback(error, config);
          });
        } else {
          callback(null, config);
        }
      });
    }], (error, config) => {
      console.log(error, config);
      if (error) throw errors;
      return config;
    });
  }
};
