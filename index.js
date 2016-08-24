// Node.js Modules
let fs = require('fs');
let path = require('path');

// Third Party Modules
let program = require('commander');
let _ = require('lodash');

// Load default Configuration
let defaultConfig = require('./lib/config/');

// Set Application's useage
program.version('0.1.0')
  .usage('-c <configuration file>')
  .option('-c, --config <file ...>', 'Sets the path to a configuration file on disk')

program.on('--help', function(){
  console.log('  Examples:');
  console.log('');
  console.log('    $ node index.js');
  console.log('    $ node idnex.js -c config.json');
  console.log('    $ node idnex.js --config config.json');
  console.log('');
});

program.parse(process.argv);

// Get custom configuration file path from argument
let customConfigFile = program.config || '';

// Merge custom configuration and default configuration
let config = defaultConfig;
if (customConfigFile.length > 0) {
  // Load custom cofiguration from file system.
  let customConfig = JSON.parse(fs.readFileSync(path.resolve(__dirname, customConfigFile)));
  config = _.assignIn({}, defaultConfig, customConfig);
}

// Resolve relative path to absolute path
config.data.file = path.resolve(__dirname, config.data.file);
// Set config into Global namespace
global.config = config;

// startup gateway
let gateway =  require('./lib/gateway/')();
// startup admin api
let admin =  require('./lib/admin/')();

