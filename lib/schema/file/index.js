let _ = require('lodash');
let fs = require('fs');
let uuid = require('uuid');
let ngxMatcher = require('../../matcher/');

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
      if (error) throw error;
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
    if (index === -1) {
      return (callback) => {
        callback(null, dataStorage);
      };
    };

    let updated = _.assignIn({}, dataStorage[index], target);

    return (callback) => {
      dataStorage[index] = updated;
      _writeData(dataStorage, (error) => {
        callback(error, dataStorage);
      });
    };
  },
  matcher: function(location, callback) {
    callback(null, ngxMatcher.matcher(location, dataStorage));
  }
};

module.exports = fileAdapter;
