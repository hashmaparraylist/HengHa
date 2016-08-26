const fs = require('fs');
const _ = require('lodash');

let dataStorage = [];
let dataFile;

// Write Api datas from data file
let _writeData = function(data) {
  fs.writeFileSync(dataFile, JSON.stringify(data));
};

// Read Api datas from data file
let _readData = function(file) {
  return JSON.parse(fs.readFileSync(file).toString() || '[]');
};

let _watchStorage = function(file) {
  fs.watch(file, () => {
    dataStorage = _readData(file);
  });
}

let fileAdapter = {
  init: function(file) {
    dataFile = file;
    // Read api datas from data file
    dataStorage = _readData(dataFile);
    // Watch data file
    _watchStorage(dataFile);
  }, 
  get: (id) => {
    let target = _.find(dataStorage, (element) => element.id === id );
    if (target) {
      return target;
    }
    return {};
  },
  create: (newApi) => {
    newApi.id = uuid.v1();
    dataStorage.push(newApi);
    _writeData();
    return newApi;
  },
  delete: (id) => {
    _.remove(dataStorage, function(element) {
      return element.id === id;
    });
    _writeData();
  },
  update: (id, target) => {
    let index = _.findIndex(apiDatas, (element) => element.id === id);
    if (index === -1) return {};
    let updated = _.assignIn({}, apiDatas[index], target);

    apiDatas[index] = updated;
    _writeData();
    return updated;
  },
  matcher: (location) => {
    // TODO matcher loaction
    return {
      location: '',
      proxy_pass: ''
    };
  }
};
