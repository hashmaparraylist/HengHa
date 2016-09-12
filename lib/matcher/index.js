const Queue = require('./nginx_matcher/queue').Queue;
const ngx_queue_init = require('./nginx_matcher/queue').ngx_queue_init;
const ngx_queue_pprint = require('./nginx_matcher/queue').ngx_queue_pprint;
const Location = require('./nginx_matcher/location').Location;
const parse = require('./nginx_matcher/location').parse;
const unserialize = require('./nginx_matcher/location').unserialize;
const ngx_http_add_location = require('./nginx_matcher/location').ngx_http_add_location;
const LocationQueue = require('./nginx_matcher/locationqueue').LocationQueue;
const LocationTree = require('./nginx_matcher/locationtree').LocationTree;
const ngx_http_init_locations = require('./nginx_matcher/locationtree').ngx_http_init_locations;
const ngx_http_find_static_location = require('./nginx_matcher/locationtree').ngx_http_find_static_location;
const ngx_http_init_static_location_trees = require('./nginx_matcher/locationtree').ngx_http_init_static_location_trees;
const ngx_http_create_locations_list = require('./nginx_matcher/locationtree').ngx_http_create_locations_list;
const ngx_http_core_find_location = require('./nginx_matcher/locationtree').ngx_http_core_find_location;

module.exports = {
  matcher: function(uri, apis) {
    let locations = null;
    try {
        locations = parse(apis);
    } catch (e) {
        return e;
    }
    const regex_locations = [];
    const named_locations = [];
    const tracknodes = [];

    ngx_http_init_locations(locations, regex_locations, named_locations);
    const static_locations = ngx_http_init_static_location_trees(locations);

    const trackID = [];
    const track = (id) => {
        trackID.push(id);
    }
    const x = ngx_http_core_find_location(uri, static_locations, regex_locations, named_locations, track);

    return x;
  }
};
