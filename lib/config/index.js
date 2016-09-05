// Require Module
const fs = require('fs');
const path = require('path');
const async = require('async');
const _ = require('lodash');

let _conf = {
  data: {
    file: './data/hengha.json'
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
  getConfig: (customConfigFile, cb) => {
    // If custom config file is not specified
    if (customConfigFile.length === 0) {
      return _conf;
    }

    // Check custom config file is exists
    fs.accessSync(customConfigFile, fs.R_OK);

    // Load custom config file
    let contents = fs.readFileSync(customConfigFile);
    // Parse custom config file's content to JSON
    let customConfig = JSON.parse(contents.toString('utf8')); 
    // Merge custom configuration and default configuration
    let config = _.defaultsDeep(_conf, customConfig);
    return config;
  },
  generateDataFile: (config) => {
    // Get dirname for datafile
    let dataDirname = path.dirname(config.data.file);

    // Check datafile path is exists
    fs.accessSync(dataDirname, fs.R_OK | fs.W_OK);

    // Check datafile is exists
    try {
      fs.accessSync(config.data.file, fs.R_OK | fs.W_OK)
    } catch (e) {
      fs.writeFileSync(config.data.file, '');
    }

    return config;
  }
};
