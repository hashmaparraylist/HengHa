const fs = require('fs');
const _ = require('lodash');

let dataStorage = [];
let dataFile;

// Write Api datas from data file
let _writeData = function(data, callback) {
  fs.writeFile(dataFile, JSON.stringify(data), callback);
};

// Read Api datas from data file
let _readData = function(file, callback) {
  fs.readFile(file, (error, buffer) => {
    if (error) {
      callback(error);
    } else {
      callback(null, JSON.parse(buffer.toString() || '[]'));
    }
  });
};

let _watchStorage = function(file) {
  fs.watch(file, () => {
    _readData(file, (error, data) => {
      dataStorage = data;
    });
  });
}

let fileAdapter = {
  init: function(file) {
    dataFile = file;
    // Read api datas from data file
    _readData(dataFile, (error, data) => {
      dataStorage = data;
      // Watch data file
      _watchStorage(dataFile);
    });
  }, 
  getAll: function() {
    return (callback) => {
      _readData(dataFile, (error, data) => {
        dataStorage = data;
        callback(error, dataStorage);
      });
    };
  },
  get: function(id) {
    return (callback) => {
      let target = _.find(dataStorage, (element) => element.id === id );
      if (target) {
        callback(null, target);
      } else {
        callback(null, {});
      }
    };
  },
  create: function(newApi) {
    newApi.id = uuid.v1();
    return (callback) => {
      dataStorage.push(newApi);
      _writeData(dataStorage, (error) => {
        callback(error, newApi);
      });
    };
  },
  delete: function(id) {
    _.remove(dataStorage, (element) => element.id === id );
    return (callback) => {
      _writeData(dataStorage, (error) => {
        callback(error, dataStorage);
      });
    }
  },
  update: function(id, target) {
    let index = _.findIndex(dataStorage, (element) => element.id === id);
    if (index === -1) return {};
    let updated = _.assignIn({}, dataStorage[index], target);

    dataStorage[index] = updated;
    return (callback) => {
      _writeData(dataStorage, (error) => {
        callback(error, dataStorage);
      });
    };
  },
  matcher: function(location) {
    return (callback) => {
      let apis = dataStorage.map((e) => {
        let pattern = e.location;
        if (e.location[e.location.length - 1] == '/') {
          pattern += '*';
        } else {
          pattern += '/*';
        }

        e.pattern = pattern;
        return e;
      });

      let proxySites = api.filter((e) => {
        let regexp = new RegExp(e.pattern);
        return regexp.test(location);
      });

      if (proxySites.length === 0) {
        callback(null, {});     
      } else {
        callback(null, proxySites[0]);     
      }
    };
  }
};
