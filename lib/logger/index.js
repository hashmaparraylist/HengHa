let winston = require('winston');

let categories = {};

let get =  (category, config) => {

    if (!categories[category]) {
      categories[category] = true;

      winston.loggers.add(category, {
        console: {
          level: config.level,
          timestamp: () => {
            return new Date();
          },
          formatter: (options) => {
            return `${options.timestamp().toISOString()} - [${options.level.toUpperCase()}] - ${(undefined !== options.message ? options.message : '')} `
              + `${(options.meta && Object.keys(options.meta).length ? '\n\t'+ JSON.stringify(options.meta) : '' )}`;
          }
        }
      });
    }

    return winston.loggers.get(category);
  }

module.exports = {
  get: get
};
