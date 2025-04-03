import { Path } from '@ivy-industries/cross-path';
import cluster from 'node:cluster';
import { randomUUID } from 'node:crypto';
import { IncomingMessage } from 'node:http';
import { inspect } from 'node:util';

import type { Route } from '../routing.js';
import type { RoutingServerResponse } from './routing-server-response.js';

import { routing } from '../routing.js';

const path = new Path();

type ImportedRoute = {
  [path:string]: Route
  get: Route,
  post: Route,
};

type RoutingRoute = Map<string, ImportedRoute | Route>;

/****************************************************************************************
 * Represents the routing functionality for HTTP & HTTPS server responses and requests. *
 ****************************************************************************************/

/**
 * Class representing a routing incoming message.
 * @extends IncomingMessage - extends the IncomingMessage class.
 */
export class RoutingIncomingMessage
  extends IncomingMessage {

  #url_internal: string;
  #url_sanitized: string;
  #url_search_params_internal: URLSearchParams | undefined;

  ip_address = undefined;
  post_data: Buffer = Buffer.alloc( 0 );
  route_module: Route;
  routes: RoutingRoute = routing.get( 'routes' );

  constructor( ...args: ConstructorParameters<typeof IncomingMessage> ) {
    super( ...args );

    this.socket.on( 'error', ( error ) => {
      process.stderr.write( error.message );
      cluster.worker?.disconnect();
    } );

    this.#cluster_check();
  }

  #cluster_check() : void {

    if ( ( cluster.isWorker && ! cluster.worker?.id ) || cluster.isPrimary ) {

      const error = inspect( {
        isWorker: cluster.isWorker,
        idIsSet: cluster.worker?.id,
        processPID: process.pid,
      } );

      this.socket.destroy( Error( error ) );
    }
  }

  /**
   * Retrieves the URLSearchParams object for the current URL.
   *
   * @returns {URLSearchParams | undefined} URLSearchParams object for the current URL.
   * Returns undefined if no parameters are found.
   */
  get(): URLSearchParams | undefined {

    try {
      const urlSearchParams = new URL( this.url, 'http://ivy.run' ).searchParams;

      return urlSearchParams.size === 0
        ? undefined
        : urlSearchParams;
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    catch ( error ) {

      return undefined;
    }
  }

  async #route(): Promise< ( ImportedRoute|Route )| boolean> {

    if ( this.routes.get( this.#url_sanitized ) ) {

      return this.routes.get( this.#url_sanitized );
    }

    return false;
  }

  #strip_hash_from_url(): string {

    const url_object = new URL( this.url, 'http://ivy.run' );

    return url_object.hash.length > 0
      ? url_object.href.replace( url_object.hash, '' )
      : this.url;

  }

  #strip_search_params_from_url( url: URLSearchParams | undefined ): string {

    if ( url !== undefined ) {
      return this.#url_internal.replace( `?${ url }`, '' );
    }

    return this.#url_internal;
  }


  /**
   * todo - add support for HEAD
   * todo - add support for OPTIONS
   * todo - add support for TRACE
   * todo - add support for CONNECT
   * todo - add support for PATCH
   * todo - add support for PUT
   * todo - add support for DELETE
   */

  async post(): Promise<Buffer> {

    if ( this.method === 'POST' && this.readable ) {

      for await ( const chunk of this ) {

        this.post_data = Buffer.concat( [ this.post_data, chunk ] );
      }

      return this.post_data;
    }

    return undefined;
  }

  async route(): Promise<void> {

    this.#url_internal = this.#strip_hash_from_url();
    this.#url_search_params_internal = this.get();
    this.#url_sanitized = this.#strip_search_params_from_url( this.#url_search_params_internal );

    const potential_route = await this.#route();
    if ( typeof potential_route === 'function' ) {
      this.route_module = potential_route;

      return;
    }

    let module: ImportedRoute = potential_route as ImportedRoute;

    if ( typeof potential_route === 'boolean' && potential_route === false ){

      const uuid = `?${ randomUUID().slice( 0, 6 ) }`;
      const hot_route_reload = ! routing.get( 'hot-routes' )
        ? ''
        : uuid;
      const route_path = path.resolve( ...[ routing.get( 'routes-path' ), ...this.#url_sanitized.concat( `.js` ).split( '/' ).splice( 1 ) ] );

      if ( ! await path.isFile( route_path )
        .catch( () => false ) ) {
        return;
      }

      module = await import( `${ route_path }${ hot_route_reload }` );
    }

    const module_exports = Object.keys( module );

    if ( module_exports.length === 0 ) {
      return;
    }
    else if ( this.#url_search_params_internal?.size > 0 && module_exports.includes( 'get' ) && this.method === 'GET' ) {

      this.route_module = module.get as Route;
    }
    else if ( module_exports.includes( 'post' ) && this.method === 'POST' ) {

      this.route_module = module.post as Route;
    }
    else if ( module_exports.includes( this.method ) && this.method !== 'GET' && this.method !== 'POST' ) {

      this.route_module = module[ this.method ] as Route;
    }
    else {

      this.route_module = module[ path.basename( this.#url_sanitized ) ] as Route;
    }
  }

  set_ip_address(): void {

    this.ip_address = this.headers[ 'x-forwarded-for' ] || this.socket.remoteAddress;
  }

  to_object( json: string, res: RoutingServerResponse< RoutingIncomingMessage > ): {}{

    try{

      return JSON.parse( json );
    }
    catch( error ){

      process.stderr.write( error.message );
      res.writeHead( 500 );
      res.end( 'internal server error' );
    }
  }

  get url_search_params(): URLSearchParams | undefined {

    return this.#url_search_params_internal;
  }
}
