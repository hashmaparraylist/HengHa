let fs = require('fs');
let program = require('commander');
let _ = require('lodash');


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
let customConfigFile = program.config

// Load default Configuration
let defaultConfig = require('./lib/config/');


// Merge custom configuration and default configuration
let config = defaultConfig;
if (customConfigFile !== "") {
  // Load custom cofiguration from file system.
  let customConfig = JSON.parse(fs.readFileSync(customConfigFile));
  config = _.assignIn({}, defaultConfig, customConfig);
}

// startup gateway
let gateway =  require('./lib/gateway/')(config);

// startup admin api
let admin =  require('./lib/admin/')(config);

