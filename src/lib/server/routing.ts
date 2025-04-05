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

type RoutingRoute = Map<string, ImportedRoute | Route>;

/**
 * todo - refactor if necessary
 */
export type Routing =
  Map<'address' |
    'exec' |
    'redirect' |
    'routes-path' |
    'served-by-name' |
    'www-root', string> &
  Map<'cluster' |
    'control-room' |
    'cut-user-agent' |
    'ease' |
    'ease-cluster' |
    'hot-routes' |
    'live-reload' |
    'log' |
    'log-all' |
    'log-color' |
    'log-persistent' |
    'redirect-to-https' |
    'routes-active' |
    'secure' |
    'served-by' |
    'socket' |
    'to-index-html', boolean> &
  Map<'counter', 1[]> &
  Map<'log_worker', Worker> &
  Map<'cpus' | 'port', number> &
  Map<'response-time', Map<'end', number>> &
  Map<'routes', RoutingRoute> &
  Map<'multi-domain', DomainConfig> &
  Map<'virtual-routes', string[]>;

export type RequestData = Map<'data', Buffer | undefined> & Map<'url_params', URLSearchParams | undefined>;

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

export const routing: Routing = new Map();
routing.set( 'log_worker', undefined );
routing.set( 'hot-routes', false );
routing.set( 'port', 3001 );
routing.set( 'address', '0.0.0.0' );
routing.set( 'served-by', false );
routing.set( 'served-by-name', 'ivy-server' );
routing.set( 'counter', [] );
routing.set( 'control-room', false );
routing.set( 'log', false );
routing.set( 'log-color', false );
routing.set( 'log-all', false );
routing.set( 'log-persistent', false );
routing.set( 'live-reload', false );
routing.set( 'to-index-html', false );
routing.set( 'exec', '' );
routing.set( 'cpus', 1 );
routing.set( 'www-root', path.resolve( process.cwd(), 'public' ) );
routing.set( 'routes-active', false );
routing.set( 'routes-path', path.resolve( process.cwd(), 'routes' ) );
routing.set( 'ease', false );
routing.set( 'ease-cluster', false );
routing.set( 'socket', false );
routing.set( 'virtual-routes', [] );
routing.set( 'multi-domain', new Map() );
routing.set( 'cluster', false );
routing.set( 'redirect', '' );
routing.set( 'redirect-to-https', false );
routing.set( 'routes', new Map() );
routing.set( 'secure', false );
routing.set( 'cut-user-agent', false );
routing.set( 'response-time', new Map( [ [ 'end', performance.now() ] ] ) );

export async function generate_id(): Promise<string> {

  return crc( await uint8( randomUUID() ) )
    .catch( () => randomUUID().replace( /-/g, '' ).slice( 0, 8 ) );
}
