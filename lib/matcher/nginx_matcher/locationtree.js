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
const ngx_queue_middle = require('./queue').ngx_queue_middle;


function LocationTree() {
  this.left = null;
  this.tree = null;
  this.right = null;
  this.tree = null;
  this.exact = null;
  this.inclusive = null;
  this.len = null;
}


function ngx_filename_cmp(s1, s2, n) {
  let i = 0;

  while (n) {
    let c1 = s1.charCodeAt(i);
    let c2 = s2.charCodeAt(i);
    c1 = isNaN(c1) ? 0 : c1;
    c2 = isNaN(c2) ? 0 : c2;
    i = i + 1;

    // ignore caseless filesystem
    if (c1 == c2) {
      if (c1) {
        n = n - 1;
        continue;
      }

      return 0;
    }

    if (c1 == 0 || c2 == 0) {
      return c1 - c2;
    }

    c1 = (c1 == '/'.charCodeAt(0)) ? 0 : c1;
    c2 = (c2 == '/'.charCodeAt(0)) ? 0 : c2;

    return c1 - c2;
  }

  return 0;
}


function ngx_min(first, second) {
  return first < second ? first : second;
}


function ngx_http_cmp_locations(one, two) {
  const lq1 = one.data;
  const lq2 = two.data;

  const first = lq1.exact ? lq1.exact : lq1.inclusive;
  const second = lq2.exact ? lq2.exact : lq2.inclusive;

  if (first.regex && !second.regex) {
    return 1;
  }

  if (!first.regex && second.regex) {
    return -1;
  }

  if (first.regex || second.regex) {
    return 0;
  }

  const rc = ngx_filename_cmp(first.name, second.name, ngx_min(first.name.length, second.name.length) + 1);

  if (rc == 0 && !first.exact_match && second.exact_match) {
    return 1;
  }

  return rc;
}


function ngx_http_init_locations(locations, regex_locations, named_locations) {
  ngx_queue_sort(locations, ngx_http_cmp_locations);

  let r = 0;
  let n = 0;
  let regex = null;
  let named = null;
  let q = null;
  let lq = null;
  let l = null;
  for (q = ngx_queue_head(locations); q != ngx_queue_sentinel(locations); q = ngx_queue_next(q)) {
    lq = q.data;
    l = lq.exact ? lq.exact : lq.inclusive;
    // nest locations

    if (l.regex) {
      r++;
      if (regex == null) {
        regex = q;
      }

      continue;
    }
  }

  let tail = new Queue();
  if (q != ngx_queue_sentinel(locations)) {
    ngx_queue_split(locations, q, tail);
  }

  if (regex) {
    for (q = regex;
         q != ngx_queue_sentinel(locations);
         q = ngx_queue_next(q))
    {
      lq = q.data;
      regex_locations.push(lq.exact);
    }
    ngx_queue_split(locations, regex, tail);
  }

  return 0;
}


function ngx_http_init_static_location_trees(locations) {
  if (locations == null) {
    return null;
  }

  if (ngx_queue_empty(locations)) {
    return null;
  }

  let q = null;
  let lq = null;
  let l = null;
  for (q = ngx_queue_head(locations); q != ngx_queue_sentinel(locations); q = ngx_queue_next(q)) {
    lq = q.data;
    l = lq.exact ? lq.exact : lq.inclusive;
    // nest location
  }

  ngx_http_join_exact_locations(locations);
  ngx_http_create_locations_list(locations, ngx_queue_head(locations));

  return ngx_http_create_locations_tree(locations, 0);
}


function ngx_http_create_locations_list(locations, q) {
  if (q == ngx_queue_last(locations)) {
    return;
  }

  let lq = q.data;
  if (lq.inclusive == null) {
    ngx_http_create_locations_list(locations, ngx_queue_next(q));
    return;
  }

  let len = lq.name.length;
  let name = lq.name;
  let x = null;
  for (x = ngx_queue_next(q); x != ngx_queue_sentinel(locations); x = ngx_queue_next(x)) {
    let lx = x.data;

    if (len > lx.name.length || ngx_filename_cmp(name, lx.name, len) != 0) {
      break;
    }
  }

  q = ngx_queue_next(q);
  if (q == x) {
    ngx_http_create_locations_list(locations, x);
    return;
  }

  let tail = new Queue();
  ngx_queue_split(locations, q, tail);
  ngx_queue_add(lq.list, tail);

  if (x == ngx_queue_sentinel(locations)) {
    ngx_http_create_locations_list(lq.list, ngx_queue_head(lq.list));
    return;
  }

  ngx_queue_split(lq.list, x, tail);
  ngx_queue_add(locations, tail);
  ngx_http_create_locations_list(lq.list, ngx_queue_head(lq.list));

  ngx_http_create_locations_list(locations, x);
}


function ngx_http_join_exact_locations(locations) {
  let q = ngx_queue_head(locations);
  while (q != ngx_queue_last(locations)) {
    let x = ngx_queue_next(q);

    let lq = q.data;
    let lx = x.data;
    if (lq.name.length == lx.name.length && ngx_filename_cmp(lq.name, lx.name, lx.name.length) == 0) {
      if ((q.exact && x.exact) || (q.inclusive && x.inclusive)) {
        return -1;
      }
      lq.inclusive = lx.inclusive;
      ngx_queue_remove(x);

      continue;
    }

    q = ngx_queue_next(q);
  }

  return 0;
}


function ngx_http_create_locations_tree(locations, prefix) {
  const q = ngx_queue_middle(locations);
  const lq = q.data;
  const len = lq.name.length - prefix;
  const node = new LocationTree();
  let tail = new Queue();

  node.left = null;
  node.right = null;
  node.tree = null;
  node.exact = lq.exact;
  node.inclusive = lq.inclusive;
  node.len = lq.name.length;

  node.name = lq.name;
  ngx_queue_split(locations, q, tail);

  if (ngx_queue_empty(locations)) {
    if (ngx_queue_empty(lq.list)) {
      return node;
    }

    node.tree = ngx_http_create_locations_tree(lq.list, prefix+len);
    if (node.tree == null) {
      return null;
    }

    return node;
  }

  node.left = ngx_http_create_locations_tree(locations, prefix);
  if (node.left == null) {
    return null;
  }

  ngx_queue_remove(q);

  if (ngx_queue_empty(tail)) {
    if (ngx_queue_empty(lq.list)) {
      return node;
    }

    node.tree = ngx_http_create_locations_tree(lq.list, prefix+len);
    if (node.tree == null) {
      return null;
    }

    return node;
  }

  node.right = ngx_http_create_locations_tree(tail, prefix);
  if (node.right == null) {
    return null;
  }

  if (ngx_queue_empty(lq.list)) {
    return node;
  }

  node.tree = ngx_http_create_locations_tree(lq.list, prefix+len);
  if (node.tree == null) {
    return null;
  }

  return node;
}


function ngx_http_core_find_location(uri, static_locations, regex_locations, named_locations) {
  let rc = null;
  let l = ngx_http_find_static_location(uri, static_locations);
  if (l) {
    l.request_uri = ngx_http_static_replace(uri, l);
    if (l.exact_match) {
      return l;
    }
    if (l.noregex) {
      return l;
    }
    rc = l;
  }
  if (regex_locations) {
    for (let i = 0 ; i < regex_locations.length; i ++) {
      let n = null;
      if (regex_locations[i].rcaseless) {
        n = uri.match(new RegExp(regex_locations[i].name, 'i'));
      } else {
        n = uri.match(new RegExp(regex_locations[i].name));
      }
      if (n) {
        if (regex_locations[i].rcaseless) {
          regex_locations[i].request_uri = '/' + uri.replace(new RegExp(regex_locations[i].name, 'i'), '');
        } else {
          regex_locations[i].request_uri = '/' + uri.replace(new RegExp(regex_locations[i].name), '');
        }
        return regex_locations[i];
      }
    }
  }

  return rc;
}

function ngx_http_static_replace(uri, l) {
  let name = l.name;

  if (name.charAt(name.length - 1) != '/') {
    name = name + '\\w*';
  }

  return '/' + uri.replace(new RegExp(name), '');
}

function ngx_http_find_static_location(uri, node) {
  let len = uri.length;
  let rv = null;

  for (;;) {
    if (node == null) {
      return rv;
    }
    let n = len <= node.len ? len : node.len;
    let rc = ngx_filename_cmp(uri, node.name, n);
    if (rc != 0) {
      node = (rc < 0) ? node.left : node.right;

      continue;
    }
    if (len > node.len) {
      if (node.inclusive) {
        rv = node.inclusive;
        node = node.tree;
        continue;
      }

      node = node.right;
      continue;
    }
    if (len == node.len) {
      if (node.exact) {
        return node.exact;
      } else {
        return node.inclusive;
      }
    }

    node = node.left;
  }
}

module.exports = {
  LocationTree,
  ngx_filename_cmp,
  ngx_min,
  ngx_http_cmp_locations,
  ngx_http_find_static_location,
  ngx_http_init_locations,
  ngx_http_init_static_location_trees,
  ngx_http_create_locations_list,
  ngx_http_core_find_location
};
