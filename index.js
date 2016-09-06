// Node.js Modules
let fs = require('fs');
let path = require('path');

// Third Party Modules
let program = require('commander');
let _ = require('lodash');

// Load default Configuration
let configLoader = require('./lib/config/');

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
if (customConfigFile.length > 0) {
  customConfigFile = path.resolve(__dirname, customConfigFile);
}

// Get application config
let config = configLoader.getConfig(customConfigFile);
config.data.file = path.resolve(__dirname, config.data.file);
// Generate Data file from config
config = configLoader.generateDataFile(config);

// startup gateway
let gateway =  require('./lib/gateway/');
gateway.init(config, require('./lib/logger/').get('gateway', config.gateway.logger));
gateway.startup();

// startup admin api
let adminEndpoint =  require('./lib/admin/');
adminEndpoint.init(config, require('./lib/logger/').get('admin', config.admin.logger));
adminEndpoint.startup();
