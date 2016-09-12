const Queue = require('./queue').Queue;

function LocationQueue(name, proxyPass) {
  this.name = name;
  this.queue = null;
  this.exact = null;
  this.inclusive = null;
  this.list = new Queue();
  this.proxyPass = proxyPass;
}


module.exports = {
  LocationQueue,
};
