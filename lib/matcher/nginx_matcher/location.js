const LocationQueue = require('./locationqueue').LocationQueue;
const Queue = require('./queue').Queue;
const ngx_queue_init = require('./queue').ngx_queue_init;
const ngx_queue_next = require('./queue').ngx_queue_next;
const ngx_queue_sentinel = require('./queue').ngx_queue_sentinel;
const ngx_queue_empty = require('./queue').ngx_queue_empty;
const ngx_queue_insert_after = require('./queue').ngx_queue_insert_after;
const ngx_queue_insert_tail = require('./queue').ngx_queue_insert_tail;
const ngx_queue_head = require('./queue').ngx_queue_head;
const ngx_queue_last = require('./queue').ngx_queue_last;
const ngx_queue_prev = require('./queue').ngx_queue_prev;
const ngx_queue_remove = require('./queue').ngx_queue_remove;
const ngx_queue_split = require('./queue').ngx_queue_split;
const ngx_queue_add = require('./queue').ngx_queue_add;
const ngx_queue_sort = require('./queue').ngx_queue_sort;
const ngx_queue_pprint = require('./queue').ngx_queue_pprint;

function makeid(len) {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i = 0; i < len; i++ ) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }

    return text;
};

function Location(name, proxyPass) {
  this.id = makeid(20);
  this.name = name;
  this.noname = false;
  this.named = false;
  this.exact_match = false;
  this.noregex = false;
  this.regex = false;
  this.rcaseless = false;
  this.proxyPass = proxyPass;
  this.request_uri = '';
};


function ngx_http_add_location(locations, location) {
  const lq = new LocationQueue(location.name, location.proxyPass);

  if (location.exact_match || location.regex ||
      location.named || location.noname) {
    lq.exact = location;
    lq.inclusive = null;
  } else {
    lq.exact = null;
    lq.inclusive = location;
  }

  const q = new Queue(lq);
  ngx_queue_init(lq.list);
  ngx_queue_insert_tail(locations, q);
}


function parse(apis) {
  const locations = new Queue();
  ngx_queue_init(locations);

  apis.forEach((api) => {
    const locationline = api.location;
    const args = locationline.replace(/\s+/g, ' ').trim().split(' ');
    if (args.length == 1) {
      const location = new Location(args[0], api.proxy_pass);
      ngx_http_add_location(locations, location);
    } else if (args.length == 2) {
      const location = new Location(args[1], api.proxy_pass);

      const type = args[0];
      switch(type) {
        case '~':
          location.regex = true;
          break;
        case '=':
          location.exact_match = true;
          break;
        case '^~':
          location.noregex = true;
          break;
        case '~*':
          location.regex = true;
          location.rcaseless = true;
          break;
        default:
          throw new Error(`only support "~ = ^~" but you "${locationline}" is ${type}`);
      }

      ngx_http_add_location(locations, location);
    } else {
      throw new Error('nginx conf unknow location format');
    }
  });

  return locations;
};

module.exports = {
  Location,
  ngx_http_add_location,
  parse
};
