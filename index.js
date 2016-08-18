// Load default Configuration
let defaultConfig = require('./lib/config/');

// TODO Load custom cofiguration from file system.

// Merge custom configuration and default configuration
let config = defaultConfig;

// startup gateway
let gateway =  require('./lib/gateway/')(config);

// startup admin api
let admin =  require('./lib/admin/')(config);

