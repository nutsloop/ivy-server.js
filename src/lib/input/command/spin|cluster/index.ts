import { command, flag } from '@ivy-industries/input';

import { command_call } from '../../../logic.js';
import { spin_cluster_cb } from './cb.js';
import { address_cb } from './flag/address/cb.js';
import { cpus_cb } from './flag/cpus/cb.js';
import { cut_user_agent_cb } from './flag/cut-user-agent/cb.js';
import { exec_cb } from './flag/exec/cb.js';
import { hot_routes_cb } from './flag/hot-routes/cb.js';
import { https_cb } from './flag/https/cb.js';
import { live_reload_cb } from './flag/live-reload/cb.js';
import { log_cb } from './flag/log/cb.js';
import { log_all_cb } from './flag/log-all/cb.js';
import { log_color_cb } from './flag/log-color/cb.js';
import { log_persistent_cb } from './flag/log-persistent/cb.js';
import { port_cb } from './flag/port/cb.js';
import { routes_cb } from './flag/routes/cb.js';
import { served_by_cb } from './flag/served-by/cb.js';
import { to_index_html_cb } from './flag/to-index-html/cb.js';
import { virtual_routes_cb } from './flag/virtual-routes/cb.js';
import { www_root_cb } from './flag/www-root/cb.js';
import {
  cluster_cpus_description,
  cluster_cpus_usage,
  cluster_exec_description,
  cluster_exec_usage,
  spin_cluster_address_description,
  spin_cluster_address_usage,
  spin_cluster_cut_user_agent_description,
  spin_cluster_cut_user_agent_usage,
  spin_cluster_hot_routes_description,
  spin_cluster_hot_routes_usage,
  spin_cluster_https_description,
  spin_cluster_https_usage,
  spin_cluster_live_reload_description,
  spin_cluster_live_reload_usage,
  spin_cluster_log_all_description,
  spin_cluster_log_all_usage,
  spin_cluster_log_color_description,
  spin_cluster_log_color_usage,
  spin_cluster_log_description,
  spin_cluster_log_persistent_description,
  spin_cluster_log_persistent_usage,
  spin_cluster_log_usage,
  spin_cluster_port_description,
  spin_cluster_port_usage,
  spin_cluster_routes_description,
  spin_cluster_routes_usage,
  spin_cluster_served_by_description,
  spin_cluster_served_by_usage,
  spin_cluster_to_index_html_description,
  spin_cluster_to_index_html_usage,
  spin_cluster_virtual_routes_description,
  spin_cluster_virtual_routes_usage,
  spin_cluster_www_root_description,
  spin_cluster_www_root_usage
} from './man/flag/index.js';
import { spin_cluster_description, spin_cluster_usage } from './man/index.js';

export async function spin_cluster(){

  const invoked_command = command_call.values().next().value;

  await command( [ 'spin', 'cluster' ], {
    cb: spin_cluster_cb,
    description: spin_cluster_description,
    has_flag: true,
    rest: [ invoked_command === 'spin' ],
    usage: spin_cluster_usage
  } );

  await flag( [ '--port', '-p' ], {
    alias: 'port',
    cb: {
      fn: port_cb,
      type: 'sync'
    },
    description: spin_cluster_port_description,
    is_flag_of: [ 'spin', 'cluster' ],
    type: 'number',
    usage: spin_cluster_port_usage
  } );

  await flag( [ '--address', '-a' ], {
    alias: 'address',
    cb: {
      fn: address_cb,
      type: 'sync'
    },
    description: spin_cluster_address_description,
    is_flag_of: [ 'spin', 'cluster' ],
    type: 'string',
    usage: spin_cluster_address_usage
  } );

  await flag( '--https', {
    alias: 'https',
    cb: {
      fn: https_cb,
      type: 'sync'
    },
    description: spin_cluster_https_description,
    is_flag_of: [ 'spin', 'cluster' ],
    multi_type: [ 'void', 'kvp' ],
    rest: [ 'key', 'cert', 'dhparam' ],
    usage: spin_cluster_https_usage
  } );

  await flag( '--www-root', {
    alias: 'www-root',
    cb: {
      fn: www_root_cb,
      type: 'async'
    },
    description: spin_cluster_www_root_description,
    is_flag_of: [ 'spin', 'cluster' ],
    type: 'string',
    usage: spin_cluster_www_root_usage
  } );

  await flag( '--log', {
    alias: 'log',
    cb: {
      fn: log_cb,
      type: 'sync'
    },
    description: spin_cluster_log_description,
    is_flag_of: [ 'spin', 'cluster' ],
    usage: spin_cluster_log_usage,
    void: true
  } );

  await flag( '--log-color', {
    alias: 'log-color',
    cb: {
      fn: log_color_cb,
      type: 'sync'
    },
    depends_on: [ '--log' ],
    description: spin_cluster_log_color_description,
    is_flag_of: [ 'spin', 'cluster' ],
    usage: spin_cluster_log_color_usage,
    void: true
  } );

  await flag( '--log-all', {
    alias: 'log-all',
    cb: {
      fn: log_all_cb,
      type: 'sync'
    },
    description: spin_cluster_log_all_description,
    has_conflict: [ '--log' ],
    is_flag_of: [ 'spin', 'cluster' ],
    usage: spin_cluster_log_all_usage,
    void: true
  } );

  await flag( '--log-persistent', {
    alias: 'log-persistent',
    cb: {
      fn: log_persistent_cb,
      type: 'async'
    },
    depends_on: [ '--log' ],
    description: spin_cluster_log_persistent_description,
    has_conflict: [ '--log-all' ],
    is_flag_of: [ 'spin', 'cluster' ],
    multi_type: [ 'void', 'number' ],
    usage: spin_cluster_log_persistent_usage
  } );

  await flag( '--cut-user-agent', {
    alias: 'cut-user-agent',
    cb: {
      fn: cut_user_agent_cb,
      type: 'sync'
    },
    description: spin_cluster_cut_user_agent_description,
    is_flag_of: [ 'spin', 'cluster' ],
    usage: spin_cluster_cut_user_agent_usage,
    void: true
  } );

  await flag( '--routes', {
    alias: 'routes',
    cb: {
      fn: routes_cb,
      type: 'async'
    },
    description: spin_cluster_routes_description,
    is_flag_of: [ 'spin', 'cluster' ],
    multi_type: [ 'void', 'string' ],
    usage: spin_cluster_routes_usage
  } );

  await flag( '--hot-routes', {
    alias: 'hot-routes',
    cb: {
      fn: hot_routes_cb,
      type: 'sync'
    },
    description: spin_cluster_hot_routes_description,
    is_flag_of: [ 'spin', 'cluster' ],
    usage: spin_cluster_hot_routes_usage,
    void: true
  } );

  await flag( '--virtual-routes', {
    alias: 'virtual-routes',
    cb: {
      fn: virtual_routes_cb,
      type: 'async'
    },
    depends_on: [ '--to-index-html' ],
    description: spin_cluster_virtual_routes_description,
    is_flag_of: [ 'spin', 'cluster' ],
    multi_type: [ 'void', 'string' ],
    usage: spin_cluster_virtual_routes_usage
  } );

  await flag( '--to-index-html', {
    alias: 'to-index-html',
    cb: {
      fn: to_index_html_cb,
      type: 'async'
    },
    description: spin_cluster_to_index_html_description,
    is_flag_of: [ 'spin', 'cluster' ],
    precedence: 1,
    usage: spin_cluster_to_index_html_usage,
    void: true
  } );

  await flag( '--served-by', {
    alias: 'served-by',
    cb: {
      fn: served_by_cb,
      type: 'async'
    },
    description: spin_cluster_served_by_description,
    is_flag_of: [ 'spin', 'cluster' ],
    type: 'string',
    usage: spin_cluster_served_by_usage
  } );

  await flag( '--live-reload', {
    alias: 'live-reload',
    cb: {
      fn: live_reload_cb,
      type: 'async'
    },
    description: spin_cluster_live_reload_description,
    is_flag_of: [ 'spin', 'cluster' ],
    multi_type: [ 'void', 'kvp' ],
    precedence: 2,
    usage: spin_cluster_live_reload_usage,
  } );

  // cluster only flags
  await flag( '--cpus', {
    alias: 'cpus',
    cb: {
      fn: cpus_cb,
      type: 'sync'
    },
    description: cluster_cpus_description,
    is_flag_of: 'cluster',
    type: 'number',
    usage: cluster_cpus_usage
  } );

  await flag( '--exec', {
    alias: 'exec',
    cb: {
      fn: exec_cb,
      type: 'async'
    },
    description: cluster_exec_description,
    is_flag_of: 'cluster',
    type: 'string',
    usage: cluster_exec_usage
  } );
}
