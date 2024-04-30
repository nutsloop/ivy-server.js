import { global } from '@ivy-industries/input';

import { ease_cb } from './flag/ease/cb.js';
import { ease_cluster_cb } from './flag/ease-cluster/cb.js';
import { socket_cb } from './flag/socket/cb.js';
import {
  global_ease_cluster_description,
  global_ease_cluster_usage,
  global_ease_description,
  global_ease_usage,
  global_socket_description,
  global_socket_usage
} from './man/index.js';

export async function globals(){

  await global( '--ease', {
    cb: {
      fn: ease_cb,
      type: 'sync'
    },
    description: global_ease_description,
    usage: global_ease_usage,
    void: true
  } );

  await global( '--ease-cluster', {
    cb: {
      fn: ease_cluster_cb,
      type: 'sync'
    },
    description: global_ease_cluster_description,
    only_for: 'cluster',
    usage: global_ease_cluster_usage,
    void: true
  } );

  await global( '--socket', {
    cb: {
      fn: socket_cb,
      type: 'async'
    },
    description: global_socket_description,
    multi_type: [ 'number', 'void' ],
    usage: global_socket_usage
  } );
}
