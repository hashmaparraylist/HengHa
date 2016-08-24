let defaultConfig = {
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

module.exports = defaultConfig;
