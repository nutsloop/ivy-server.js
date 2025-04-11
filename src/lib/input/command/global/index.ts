import { global } from '@nutsloop/ivy-input';

import { ease_cluster_cb } from './flag/ease-cluster/cb.js';
import { ease_cb } from './flag/ease/cb.js';
import {
  global_ease_cluster_description,
  global_ease_cluster_usage,
  global_ease_description,
  global_ease_usage,
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
}
