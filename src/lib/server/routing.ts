import { Path } from '@nutsloop/ivy-cross-path';
import { type Worker } from 'node:cluster';
import { randomUUID } from 'node:crypto';
import { performance } from 'node:perf_hooks';

import type { DomainConfig } from './dispacher.js';

import { crc } from '../function/crc.js';
import { uint8 } from '../function/uint8.js';
import { RoutingIncomingMessage } from './routing/routing-incoming-message.js';
import { RoutingServerResponse } from './routing/routing-server-response.js';

const path = new Path();

type ImportedRoute = {
  [path:string]: Route
  get: Route,
  post: Route,
};

export type RoutingRoute = Map<string, ImportedRoute | Route>;
export type RequestData = Map<'data', Buffer | undefined | void> & Map<'url_params', URLSearchParams | undefined | void>;

/**
 * why is this done this way?
 */
type ServerTypesResponse = RoutingServerResponse<RoutingIncomingMessage>
type ServerTypeIncoming = RoutingIncomingMessage

/**
 * todo - rewrites Routes Type using rest args and dynamic types
 */
type AsyncRoute = ( this: RequestData, IncomingMessage: ServerTypeIncoming, ServerResponse: ServerTypesResponse ) => Promise<Buffer | void>;
type SyncRoute = ( this: RequestData, IncomingMessage: ServerTypeIncoming, ServerResponse: ServerTypesResponse ) => Buffer | void;
type PromiseRoute = ( this: RequestData, IncomingMessage: ServerTypeIncoming, ServerResponse: ServerTypesResponse ) => PromiseLike<Buffer | void>;
export type Route = AsyncRoute | PromiseRoute | SyncRoute;

export type LiveReloadConf = Map<'host' | 'cors_port', string> &
  Map<'port', number>;

/**
 * todo - refactor if necessary
 */
export type RoutingKey =
  | 'acme-challenge'
  | 'address'
  | 'cluster'
  | 'control-room'
  | 'counter'
  | 'cpus'
  | 'cut-user-agent'
  | 'ease'
  | 'ease-cluster'
  | 'exec'
  | 'hot-routes'
  | 'live-reload'
  | 'live-reload-conf'
  | 'log'
  | 'log-color'
  | 'log-persistent'
  | 'log_worker'
  | 'multi-domain'
  | 'mute-client-error'
  | 'port'
  | 'redirect'
  | 'redirect-to-https'
  | 'response-time'
  | 'routes'
  | 'routes-active'
  | 'routes-path'
  | 'secure'
  | 'served-by'
  | 'served-by-name'
  | 'socket'
  | 'to-index-html'
  | 'virtual-routes'
  | 'www-root';

export type RoutingValueMap = {
  'acme-challenge': boolean;
  'address': string;
  'cluster': boolean;
  'control-room': boolean;
  'counter': 1[];
  'cpus': number;
  'cut-user-agent': boolean;
  'ease': boolean;
  'ease-cluster': boolean;
  'exec': string;
  'hot-routes': boolean;
  'live-reload': boolean;
  'live-reload-conf': LiveReloadConf;
  'log': boolean;
  'log-color': boolean;
  'log-persistent': boolean;
  'log_worker': Worker | undefined;
  'multi-domain': DomainConfig;
  'mute-client-error': boolean;
  'port': number;
  'redirect': string;
  'redirect-to-https': boolean;
  'response-time': number;
  'routes': RoutingRoute;
  'routes-active': boolean;
  'routes-path': string;
  'secure': boolean;
  'served-by': boolean;
  'served-by-name': string;
  'socket': boolean;
  'to-index-html': boolean;
  'virtual-routes': string[];
  'www-root': string;
};

export type RoutingValue = RoutingValueMap[RoutingKey];

export class RoutingMap extends Map<RoutingKey, RoutingValue> {
  constructor() {
    super();

    const entries: [RoutingKey, RoutingValue][] = [
      [ 'acme-challenge', false ],
      [ 'address', '0.0.0.0' ],
      [ 'cluster', false ],
      [ 'control-room', false ],
      [ 'counter', [] ],
      [ 'cpus', 1 ],
      [ 'cut-user-agent', false ],
      [ 'ease', false ],
      [ 'ease-cluster', false ],
      [ 'exec', '' ],
      [ 'hot-routes', false ],
      [ 'live-reload', false ],
      [ 'live-reload-conf', new Map() ],
      [ 'log', false ],
      [ 'log-color', false ],
      [ 'log-persistent', false ],
      [ 'log_worker', undefined ],
      [ 'multi-domain', new Map() ],
      [ 'mute-client-error', false ],
      [ 'port', 3001 ],
      [ 'redirect', '' ],
      [ 'redirect-to-https', false ],
      [ 'response-time', performance.now() ],
      [ 'routes', new Map() ],
      [ 'routes-active', false ],
      [ 'routes-path', path.resolve( process.cwd(), 'routes' ) ],
      [ 'secure', false ],
      [ 'served-by', false ],
      [ 'served-by-name', 'ivy-server' ],
      [ 'socket', false ],
      [ 'to-index-html', false ],
      [ 'virtual-routes', [] ],
      [ 'www-root', path.resolve( process.cwd(), 'public' ) ],
    ];
    for ( const [ key, value ] of entries ) {
      this.set( key, value );
    }
  }

  override get<K extends RoutingKey>( key: K ): RoutingValueMap[K] {
    return super.get( key )! as RoutingValueMap[K];
  }
}
export type Routing = Map<keyof RoutingValueMap, RoutingValue>;
export const routing = new RoutingMap();

export async function generate_id(): Promise<string> {

  return crc( await uint8( randomUUID() ) )
    .catch( () => randomUUID().replace( /-/g, '' ).slice( 0, 8 ) );
}
