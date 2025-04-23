import { command, flag } from '@nutsloop/ivy-input';

import { command_call } from '../../../logic.js';
import { routing } from '../../../server/routing.js';
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
import { log_request_headers_cb } from './flag/log_request_headers/cb.js';
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
  cluster_exec_usage, spin_cluster_acme_challenge_description, spin_cluster_acme_challenge_usage,
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
  spin_cluster_log_persistent_usage, spin_cluster_log_request_headers_usage,
  spin_cluster_log_usage,
  spin_cluster_multi_domain_description, spin_cluster_multi_domain_usage, spin_cluster_mute_client_error_description, spin_cluster_mute_client_error_usage,
  spin_cluster_port_description,
  spin_cluster_port_usage,
  spin_cluster_redirect_to_description, spin_cluster_redirect_to_https_description,
  spin_cluster_redirect_to_https_usage,
  spin_cluster_redirect_to_usage,
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

  // commands spin|cluster
  await command( [ 'spin', 'cluster' ], {
    cb: spin_cluster_cb,
    description: spin_cluster_description,
    has_flag: true,
    rest: [ invoked_command === 'spin' ],
    usage: spin_cluster_usage
  } );

  // spin|cluster flags

  // --acme-challenge[-ac] flag
  await flag( [ '--acme-challenge', '-ac' ], {
    alias: 'acme-challenge',
    cb:{
      fn: acme_challenge_cb,
      type: 'sync'
    },
    description: spin_cluster_acme_challenge_description,
    is_flag_of: [ 'spin', 'cluster' ],
    usage: spin_cluster_acme_challenge_usage,
    void: true
  } );

  // --address[-a]
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

  // --control-room[-cr]
  await flag( [ '--control-room', '-cr' ], {
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

  // --cut-user-agent[-cua]
  await flag( [ '--cut-user-agent', '-cua' ], {
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

  // --hot-routes[-hr]
  await flag( [ '--hot-routes', '-hr' ], {
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

  // --https[-S]
  await flag( [ '--https', '-S' ], {
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

  // --live-reload[-lr]
  await flag( [ '--live-reload', '-lr' ], {
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

  // --log[-l]
  await flag( [ '--log', '-l' ], {
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

  // --log-color[-lc]
  await flag( [ '--log-color', '-lc' ], {
    alias: 'log-color',
    cb: {
      fn: log_color_cb,
      type: 'sync'
    },
    depends_on: [ '--log|-l' ],
    description: spin_cluster_log_color_description,
    is_flag_of: [ 'spin', 'cluster' ],
    usage: spin_cluster_log_color_usage,
    void: true
  } );

  // --log-persistent[-lp]
  await flag( [ '--log-persistent', '-lp' ], {
    alias: 'log-persistent',
    cb: {
      fn: log_persistent_cb,
      type: 'async'
    },
    // TODO: this may be removed in the future.
    depends_on: [ '--log|-l' ],
    description: spin_cluster_log_persistent_description,
    is_flag_of: [ 'spin', 'cluster' ],
    multi_type: [ 'void', 'number' ],
    usage: spin_cluster_log_persistent_usage
  } );

  // --log-request-headers[-lrh]
  await flag( [ '--log-request-headers', '-lrh' ], {
    alias: 'log-request-header',
    cb: {
      fn: log_request_headers_cb,
      type: 'sync'
    },
    void: true,
    usage: spin_cluster_log_request_headers_usage,
    description: spin_cluster_log_request_headers_usage,
    depends_on: [ '--log|-l' ],
    is_flag_of: [ 'spin', 'cluster' ],
  } );

  // --multi-domain[-md]
  await flag( [ '--multi-domain', '-md' ], {
    alias: 'multi-domain',
    cb: {
      fn: multi_domain_cb,
      type: 'async'
    },
    precedence: 10,
    description: spin_cluster_multi_domain_description,
    is_flag_of: [ 'spin', 'cluster' ],
    multi_type: [ 'void', 'string' ],
    usage: spin_cluster_multi_domain_usage,
  } );

  // --mute-client-error[-mce]
  await flag( [ '--mute-client-error', '-mce' ], {
    alias: 'mute-client-error',
    cb:{
      fn: mute_client_error_cb,
      type: 'sync'
    },
    description: spin_cluster_mute_client_error_description,
    is_flag_of: [ 'spin', 'cluster' ],
    usage: spin_cluster_mute_client_error_usage,
    void: true
  } );


  // --plugins[-P]


  // --port[-p]
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

  // --redirect-to[-rt]
  await flag( [ '--redirect-to', '-rt' ], {
    alias: 'redirect-to',
    cb:{
      fn: redirect_to_cb,
      type: 'sync'
    },
    description: spin_cluster_redirect_to_description,
    is_flag_of: [ 'spin', 'cluster' ],
    type: 'string',
    usage: spin_cluster_redirect_to_usage,
  } );

  // --redirect-to-https[-rth]
  await flag( [ '--redirect-to-https', '-rth' ], {
    alias: 'redirect-to-https',
    cb:{
      fn: redirect_to_https_cb,
      type: 'sync'
    },
    description: spin_cluster_redirect_to_https_description,
    depends_on: [ '--redirect-to|-rt' ],
    has_conflict: [ '--https' ],
    is_flag_of: [ 'spin', 'cluster' ],
    void: true,
    usage: spin_cluster_redirect_to_https_usage,
  } );

  // --routes[-r]
  await flag( [ '--routes', '-r' ], {
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

  // --served-by[-sb]
  await flag( [ '--served-by', '-sb' ], {
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

  // --socket[-s]
  await flag( [ '--socket', '-s' ], {
    alias: 'socket',
    cb: {
      fn: socket_cb,
      type: 'async'
    },
    description: spin_cluster_socket_description,
    is_flag_of: [ 'spin', 'cluster' ],
    void: true,
    usage: spin_cluster_socket_usage
  } );

  // --to-index-html[-tih]
  await flag( [ '--to-index-html', '-tih' ], {
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

  // --virtual-routes[-vr]
  await flag( [ '--virtual-routes', '-vr' ], {
    alias: 'virtual-routes',
    cb: {
      fn: virtual_routes_cb,
      type: 'async'
    },
    depends_on: [ '--to-index-html|-tih' ],
    description: spin_cluster_virtual_routes_description,
    is_flag_of: [ 'spin', 'cluster' ],
    multi_type: [ 'void', 'string' ],
    usage: spin_cluster_virtual_routes_usage
  } );

  // --www-root[-wr]
  await flag( [ '--www-root', '-wr' ], {
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

  // cluster only flags

  // --cpus[-c]
  await flag( [ '--cpus', '-c' ], {
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

  // --exec[-e]
  await flag( [ '--exec', '-e' ], {
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

  // experimentation
  await flag( [ '--plugins', '-P' ], {
    alias: 'plugins',
    cb: {
      fn: ( data: string[] ) => {
        for ( const plugin of data ){
          routing.get( 'plugins' ).push( plugin );
        }
      },
      type: 'sync'
    },
    type: 'array',
    usage: 'ivy-server spin|cluster --plugins=cookie-monster,request-limiter',
    description: 'a comma separated list of @nutsloop/ivy-[plugin-name] packages. no need to prefix with `@nutsloop/ivy-`.\ninstall them first as dependencies of your project.',
    is_flag_of: [ 'spin', 'cluster' ],
  } );
}
