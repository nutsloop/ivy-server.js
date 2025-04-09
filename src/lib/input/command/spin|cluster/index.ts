import { command, flag } from '@nutsloop/ivy-input';

import { command_call } from '../../../logic.js';
import { spin_cluster_cb } from './cb.js';
import { acme_challenge_cb } from './flag/acme-challenge/cb.js';
import { address_cb } from './flag/address/cb.js';
import { control_room_cb } from './flag/control-room/cb.js';
import { cpus_cb } from './flag/cpus/cb.js';
import { cut_user_agent_cb } from './flag/cut-user-agent/cb.js';
import { exec_cb } from './flag/exec/cb.js';
import { hot_routes_cb } from './flag/hot-routes/cb.js';
import { https_cb } from './flag/https/cb.js';
import { live_reload_cb } from './flag/live-reload/cb.js';
import { log_color_cb } from './flag/log-color/cb.js';
import { log_persistent_cb } from './flag/log-persistent/cb.js';
import { log_cb } from './flag/log/cb.js';
import { multi_domain_cb } from './flag/multi-domain/cb.js';
import { mute_client_error_cb } from './flag/mute-client-error/cb.js';
import { port_cb } from './flag/port/cb.js';
import { redirect_to_https_cb } from './flag/redirect-to-https/cb.js';
import { redirect_to_cb } from './flag/redirect-to/cb.js';
import { routes_cb } from './flag/routes/cb.js';
import { served_by_cb } from './flag/served-by/cb.js';
import { socket_cb } from './flag/socket/cb.js';
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
  spin_cluster_control_room_description,
  spin_cluster_control_room_usage,
  spin_cluster_cut_user_agent_description,
  spin_cluster_cut_user_agent_usage,
  spin_cluster_hot_routes_description,
  spin_cluster_hot_routes_usage,
  spin_cluster_https_description,
  spin_cluster_https_usage,
  spin_cluster_live_reload_description,
  spin_cluster_live_reload_usage,
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
  spin_cluster_socket_description,
  spin_cluster_socket_usage,
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

  await flag( '--socket', {
    alias: 'socket',
    cb: {
      fn: socket_cb,
      type: 'async'
    },
    description: spin_cluster_socket_description,
    is_flag_of: [ 'spin', 'cluster' ],
    multi_type: [ 'number', 'void' ],
    usage: spin_cluster_socket_usage
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

  await flag( '--acme-challenge', {
    alias: 'acme-challenge',
    cb:{
      fn: acme_challenge_cb,
      type: 'sync'
    },
    description: 'tells the server to serve the ACME challenge files without follow multi-domain config or global redirect to https.',
    is_flag_of: [ 'spin', 'cluster' ],
    usage: 'ivy-server spin|cluster --acme-challenge',
    void: true
  } );

  await flag( '--mute-client-error', {
    alias: 'mute-client-error',
    cb:{
      fn: mute_client_error_cb,
      type: 'sync'
    },
    description: 'it mutes the client error listener by only not printing the error to the console.',
    is_flag_of: [ 'spin', 'cluster' ],
    usage: 'ivy-server spin|cluster --mute-client-error',
    void: true
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
    depends_on: [ '--log|--log-all' ],
    description: spin_cluster_log_color_description,
    is_flag_of: [ 'spin', 'cluster' ],
    usage: spin_cluster_log_color_usage,
    void: true
  } );

  await flag( '--redirect-to', {
    alias: 'redirect-to',
    cb:{
      fn: redirect_to_cb,
      type: 'sync'
    },
    description: 'Redirect to a different URL (301 Moved Permanently)',
    is_flag_of: [ 'spin', 'cluster' ],
    type: 'string',
    usage: 'ivy-server spin|cluster --redirect-to=https://www.domain.com',
  } );

  await flag( '--redirect-to-https', {
    alias: 'redirect-to-https',
    cb:{
      fn: redirect_to_https_cb,
      type: 'sync'
    },
    description: 'Redirect to https, requires --redirect-to',
    depends_on: [ '--redirect-to' ],
    has_conflict: [ '--https' ],
    is_flag_of: [ 'spin', 'cluster' ],
    void: true,
    usage: 'ivy-server spin|cluster --redirect-to=https://www.domain.com --redirect-to-https',
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
    multi_type: [ 'void', 'string', 'kvp' ],
    precedence: 1,
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

  await flag( '--control-room', {
    alias: 'control-room',
    cb: {
      fn: control_room_cb,
      type: 'async'
    },
    description: spin_cluster_control_room_description,
    is_flag_of: [ 'spin', 'cluster' ],
    usage: spin_cluster_control_room_usage,
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

  await flag( '--multi-domain', {
    alias: 'multi-domain',
    cb: {
      fn: multi_domain_cb,
      type: 'async'
    },
    precedence: 10,
    description: `serve multiple domains from a single server instance`,
    is_flag_of: [ 'spin', 'cluster' ],
    multi_type: [ 'void', 'string' ],
    usage: `ivy-server spin|cluster --multi-domain=path/to/domain/multiDomainConfig.js`
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
