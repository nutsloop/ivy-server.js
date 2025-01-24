//import type { IncomingHttpHeaders, ServerHttp2Stream } from 'node:http2';
import type { Socket } from 'node:net';
//import type { ReadableOptions } from 'node:stream';

import { Path } from '@ivy-industries/cross-path';
import Encoding from 'encoding-japanese';
import { randomUUID } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { IncomingMessage, ServerResponse } from 'node:http';
//import { Http2ServerRequest, Http2ServerResponse } from 'node:http2';
import { performance } from 'node:perf_hooks';
import { inspect } from 'node:util';

import type { ContentTypeFileExt } from './response/content-type.js';

import { CONTENT_TYPE } from './response/content-type.js';

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
type Routing =
  Map<'address' |
    'exec' |
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
    'routes-active' |
    'secure' |
    'served-by' |
    'socket' |
    'to-index-html', boolean> &
  Map<'counter', 1[]> &
  Map<'cpus' | 'port', number> &
  Map<'response-time', Map<'end', number>> &
  Map<'routes', RoutingRoute> &
  Map<'virtual-routes', string[]>;

type ServerTypesResponse =
  /*RoutingHttp2ServerResponse<ServerHttp2Stream> | */RoutingServerResponse<IncomingMessage>
type ServerTypeIncoming =
  /*RoutingHttp2IncomingMessage | */RoutingIncomingMessage
/**
 * todo - rewrites Routes Type using rest args and dynamic types
 * todo - add the 'this' data type to the Route type
 */
type AsyncRoute = ( IncomingMessage: ServerTypeIncoming, ServerResponse: ServerTypesResponse ) => Promise<Buffer | void>;
type SyncRoute = ( IncomingMessage: ServerTypeIncoming, ServerResponse: ServerTypesResponse ) => Buffer | void;
type PromiseRoute = ( IncomingMessage: ServerTypeIncoming, ServerResponse: ServerTypesResponse ) => PromiseLike<Buffer | void>;
export type Route = AsyncRoute | PromiseRoute | SyncRoute;
export type RequestData = Map<'data', Buffer | undefined> & Map<'url_params', URLSearchParams | undefined>;

export const routing: Routing = new Map();
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
routing.set( 'cluster', false );
routing.set( 'routes', new Map() );
routing.set( 'secure', false );
routing.set( 'cut-user-agent', false );
routing.set( 'response-time', new Map( [
  [ 'end', performance.now() ]
] ) );

interface IVirtualRouteValidationSegments{
  url_segments: string[],
  virtual_segments: string[]
}

type IncomingNotData =
'data-error' |
'date' |
'host' |
'httpVersion' |
'id' |
'ip_address' |
'method' |
'referer' |
'url' |
'user-agent';

type ServerResponseIncoming =
  Map<'error', string[]> &
  Map<'request', RequestData> &
  Map<IncomingNotData, string>;

/****************************************************************************************
 * Represents the routing functionality for HTTP & HTTPS server responses and requests. *
 ****************************************************************************************/

/**
 * Class representing a routing.
 * @template K - type parameter representing the type of incoming messages.
 * @extends ServerResponse - extends the ServerResponse class.
 */
export class RoutingServerResponse<K extends IncomingMessage>
  extends ServerResponse<K> {

  #bytesRead: number = 0;
  #bytesWritten: number = 0;
  #counter: 1[] = routing.get( 'counter' );
  #isRoute: boolean = false;
  #response_time: number = performance.now();
  #route: Route;
  #wrk: 0 | number = 0;
  incoming: ServerResponseIncoming = new Map();
  listener_error = false;
  log: boolean = routing.get( 'log' );
  routes_active: boolean = routing.get( 'routes-active' );
  routes_path: string = routing.get( 'routes-path' );
  secure: boolean = routing.get( 'secure' );
  www_root: string = routing.get( 'www-root' );

  constructor( k: K ) {
    super( k );
  }

  #cut_user_agent( incoming_user_agent: string ): string {

    const browserRegex = /(Chrome|Firefox|Safari|Edge|Opera)\/[\d.]+/;

    const match = incoming_user_agent.match( browserRegex );

    if ( match && match[ 1 ] ) {

      return match[ 1 ];
    }
    else {

      return `${incoming_user_agent.slice( 0, 10 )}...`;
    }
  }

  #log_all_extname(): string{

    if( this.incoming.has ( 'url' ) ){
      return path.extname( this.incoming.get( 'url' ) );
    }

    this.incoming.set( 'url', '/unknown' );

    return '';
  }

  #log_color( message: string, color: string, decoration: boolean|string = false ): string{

    if( ! routing.get( 'log-color' ) ){
      return message;
    }

    if( typeof message !== 'string' ){
      return 'err: field is not a string'.red();
    }

    if( typeof decoration === 'string' ){
      return message[ color ]()[ decoration ]();
    }

    return message[ color ]();
  }

  #log_data(): void {

    let method_section = this.#log_color( this.incoming.get( 'method' ), 'red' );
    method_section += `(${ this.#log_color( this.bytesRead.toFixed(), 'green', 'strong' ) })`;
    method_section += `(${ this.#log_color( this.bytesWritten.toFixed(), 'red', 'strong' ) })`;

    /**
     * log format:
     * - unique id
     * - incoming method
     * - requested url
     * - status code
     * - ip address incoming
     * - hostname requested
     * - http version [http/1.1 | http/2(not supported yet)]
     * - secure [⚷ yellow | ⚷ red] -> [https | http]
     * - requests count per worker in cluster mode or total requests count in non-cluster mode
     * - wrk (id)[pid] if in cluster mode | (0)[pid] if not in cluster mode
     * - user-agent
     * - referer
     * - response time
     * - date
     * - POST|PUT|PATCH|DELETE|GET data if any
     */
    const message: string[] = [
      this.#log_color( this.incoming.get( 'id' ), 'b_white', 'bg_black' ),
      method_section,
      this.incoming.get( 'url' ),
      this.#log_color( this.statusCode.toString(), 'magenta' ),
      this.#log_color( this.incoming.get( 'ip_address' ), 'blue' ),
      this.#log_color( this.incoming.get( 'host' ), 'blue', 'strong' ),
      this.#log_color( this.incoming.get( 'httpVersion' ), 'red', 'underline' ),
      this.secure
        ? this.#log_color( '⚷', 'yellow', 'strong' )
        : this.#log_color( '⚷', 'red', 'strong' ),
      this.#log_color( this.#counter.length.toString(), 'cyan', 'strong' ),
      this.wrk === 0
        ? this.#log_color( `⟳ (0)[${ process.pid }]`, 'yellow' )
        : this.#log_color( `⟳ (${ this.wrk })[${ process.pid }]`, 'b_yellow' ),
      this.#log_color( this.incoming.get( 'user-agent' ), 'green' ),
      this.incoming.get( 'referer' ),
      `${ this.get_response_time().toFixed( 4 ) }ms`,
      this.#log_color( this.incoming.get( 'date' ), 'yellow' ),
      this.#log_data_request() === false
        ? ''
        : <string>this.#log_data_request()
    ];

    if( routing.get( 'log-persistent' ) ){
      process.send( { 'log': message } );
    }

    // if the control room is active, send the log to the control room.
    if( routing.get( 'control-room' ) ){
      process.send( { 'control-room': message.join( '|' ) } );
    }

    //logging the message to the console.
    process.stdout.write( `${ message.join( ' ' ) }\n` );

    if ( this.incoming.has( 'data-error' ) && this.incoming.get( 'data-error' ).length > 0 ) {
      process.stderr.write( `${this.incoming.get( 'data-error' )}\n` );
    }
    if ( this.incoming.has( 'error' ) && this.incoming.get( 'error' ).length > 0 ) {
      process.stderr.write( `${this.incoming.get( 'error' ).join( ', ' )}\n` );
    }

  }

  #log_data_incoming_check(){

    if ( ! this.incoming.has( 'error' ) || ! Array.isArray( this.incoming.get( 'error' ) ) ){
      this.incoming.set( 'error', [] );
    }

    if( ! this.incoming.has( 'request' ) ){
      this.incoming.get ( 'error' ).push( '[data] is missing.' );

      return;
    }

    if( ! this.incoming.get( 'request' ).has( 'url_params' ) ){
      this.incoming.get( 'error' ).push( '[url_params] is missing.' );
    }

    if( ! this.incoming.get( 'request' ).has( 'data' ) ){
      this.incoming.get( 'error' ).push( '[data] is missing.' );
    }
  }

  #log_data_request(): boolean|string{

    this.#log_data_incoming_check();

    const post_data: Buffer|undefined = this.incoming?.get( 'request' )?.get( 'data' );
    const get_data: URLSearchParams|undefined = this.incoming?.get( 'request' )?.get( 'url_params' );

    // todo: refactor this. It's a mess.
    const _post_data: number|object = post_data !== undefined && post_data.length > 0
      ? this.to_object( post_data.toString() )
      : 0;

    const _get_data: URLSearchParams|number = get_data !== undefined && get_data.size > 0
      ? get_data
      : 0;

    if( typeof _post_data === 'number' && typeof _get_data === 'number' ){
      return false;
    }

    const render_post_data: string = typeof _post_data === 'number'
      ? ''
      : inspect( _post_data, { colors: routing.get( 'log-color' ), depth: Infinity } );

    const render_get_data: string = typeof _get_data === 'number'
      ? ''
      : inspect( _get_data, { colors: routing.get( 'log-color' ), depth: Infinity } );

    return `${ render_post_data }${ render_get_data }`;

  }

  #virtual_routes_segments( url: string, virtual_route: string ): IVirtualRouteValidationSegments{

    const url_array = url.split( '/' ).filter( segment => segment !== '' );
    const virtual_route_array = virtual_route.split( '/' ).filter( segment => segment !== '' );

    return {
      url_segments: url_array,
      virtual_segments: virtual_route_array
    };
  }

  #virtual_routes_validation( url: string, virtual_route: string ): boolean {

    const { url_segments, virtual_segments } = this.#virtual_routes_segments( url, virtual_route );

    if ( url_segments.length !== virtual_segments.length ) {
      return false;
    }

    for ( let i = 0; i < virtual_segments.length; i ++ ) {

      if ( virtual_segments[ i ].startsWith( ':' ) ) {
        continue;
      }
      if ( url_segments[ i ] !== virtual_segments[ i ] ) {
        return false;
      }
    }

    return true;
  }

  close() {

    if ( ! this.writableEnded ) {
      this.end();
    }
  }

  end( data?: ( () => void ) | Buffer | Uint8Array | string, encoding?: ( () => void ) & BufferEncoding, callback?: () => void ): this {

    super.end( data, encoding, callback );

    if( this.listener_error === false ){
      routing.get( 'response-time' ).set( 'end', performance.now() );

      if ( this.log ) {

        this.#counter.push( 1 );

        const file_extension = this.#log_all_extname();

        this.bytesWritten = this.bytesWritten > 0 ? this.bytesWritten : this.socket.bytesWritten;

        if ( routing.get( 'log-all' ) ) {

          this.#log_data();
        }
        else if ( file_extension === '.html' || file_extension.length === 0 ) {

          this.#log_data();
        }
      }
    }
    // send request for the ip address to nmap. it is a standalone server maybe written in c++.

    return this;
  }

  get_response_time(): number {

    return routing.get( 'response-time' ).get( 'end' ) - this.#response_time;
  }

  /**
   * todo: error handling for routes rejected promises and, async functions and try catch for sync functions
   * todo: probably better to specify the routes type
   * - SyncFunction
   * - AsyncFunction
   * - Promise
   * with a default export of Object|Map options.
   * this options should not be mandatory.
   */
  async sendRoute( IncomingMessage: RoutingIncomingMessage ): Promise<void> {

    const internal_server_error = Buffer.from( 'Internal Server Error' );
    if ( this.route.constructor.name === 'AsyncFunction' ) {

      const response = await this.route( IncomingMessage, this );
      if ( Buffer.isBuffer( response ) ) {
        this.bytesWritten = response.length;
        this.writeHead( 200 ).end( response );
      }
      else if( response !== undefined && ! Buffer.isBuffer( response ) ){
        process.stderr.write( 'Error: AsyncFunction Routes that return instead of write|end the Buffer back to the client,\n' );
        process.stderr.write( 'must return(Buffer)\n' );
        this.bytesWritten = internal_server_error.length;
        this.writeHead( 500 ).end( internal_server_error );
      }
    }
    else if ( this.route instanceof Promise || this.route instanceof Function ) {

      let response = this.route( IncomingMessage, this );
      if ( response instanceof Promise ) {
        response = await response;
      }
      if ( Buffer.isBuffer( response ) ) {
        this.bytesWritten = response.length;
        this.writeHead( 200 ).end( response );
      }
      if( response !== undefined && ! Buffer.isBuffer( response ) ){
        process.stderr.write( 'Error: Routes that return instead of write|end the Buffer back to the client,\n' );
        process.stderr.write( 'and return a new Promise, must resolve(Buffer)\n' );
        this.bytesWritten = internal_server_error.length;
        this.writeHead( 500 ).end( internal_server_error );
      }
    }
  }

  async static( url: string ) {

    let file_requested: Error | string | string[] = url.length === 1 && url.startsWith( '/' )
      ? [ this.www_root, 'index.html' ]
      : [ this.www_root ].concat( url.split( '/' ) );

    file_requested = await path.isFile( path.resolve( ...file_requested ) )
      .catch( error => error ) as Error | string;
    if ( ! ( file_requested instanceof Error ) ) {

      const file_extension = path.basename( path.extname( file_requested ) ) as ContentTypeFileExt;
      const buffer = await readFile( file_requested );
      this.setHeader( 'Content-Type', CONTENT_TYPE.get( file_extension ) || 'text/plain' );
      this.bytesWritten = buffer.length;
      this.writeHead( 200 ).end( buffer );
    }
    else if ( routing.get( 'to-index-html' ) ) {

      let status_code: 200 | 404 = 200;

      if( routing.get( 'virtual-routes' ).length > 0 ) {

        for ( const virtual_route of routing.get( 'virtual-routes' ) ) {

          status_code = this.#virtual_routes_validation( url, virtual_route )
            ? 200
            : 404;

          if ( status_code === 200 ) {
            break;
          }
        }
      }
      const buffer = await readFile( [ this.www_root, 'index.html' ].join( '/' ) );
      this.bytesWritten = buffer.length;
      this.writeHead( status_code ).end( buffer );
    }
    else {
      const buffer = Buffer.from( '404 - Not Found' );
      this.bytesWritten = buffer.length;
      this.writeHead( 404 ).end( buffer );
    }
  }

  to_json( data: {} ): string{

    try{

      return JSON.stringify( data );
    }
    catch( error ){

      const buffer = Buffer.from( '500 - Internal Server Error' );
      process.stderr.write( `${ error.message }\n` );
      this.writeHead( 500 );
      this.bytesWritten = buffer.length;
      this.end( buffer );
    }
  }

  to_object( json: string, return_plain: boolean = true ): {}{

    try{

      return JSON.parse( json );
    }
    catch( _e ){

      const encoded = Encoding.detect( json );
      const encoding = encoded === false ? 'not detected' : ` (${ encoded })`.magenta();
      const error = `${'incoming not JSON data: '}${this.incoming.get( 'id' ).b_white().bg_black()} ${this.incoming.get( 'ip_address' ).b_red()} ${encoding}`;
      this.incoming.set( 'data-error', error );
      if ( return_plain ){
        return json;
      }

      this.writeHead( 500 );
      this.end( Buffer.from( 'internal server error' ) );
    }
  }

  user_agent( incoming_user_agent: string | undefined ): string {

    if ( incoming_user_agent === undefined ) {
      return 'Agent/Unknown';
    }

    if ( routing.get( 'cut-user-agent' ) ) {
      return this.#cut_user_agent( incoming_user_agent );
    }

    return incoming_user_agent;
  }

  get bytesRead(): number {

    return this.#bytesRead;
  }

  set bytesRead( value: number ) {

    this.#bytesRead = value;
  }

  get bytesWritten(): number {

    return this.#bytesWritten;
  }

  set bytesWritten( value: number ) {

    this.#bytesWritten = value;
  }

  set isRoute( value: boolean ) {

    this.#isRoute = value;
  }

  get isRoute(): boolean {

    return this.#isRoute;
  }

  set route( module: Route ) {

    this.#route = module;
  }

  get route(): Route {

    return this.#route;
  }

  set wrk( id: 0 | number ) {

    this.#wrk = id;
  }

  get wrk(): 0 | number {

    return this.#wrk;
  }
}

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

  constructor( socket: Socket ) {

    super( socket );
  }

  /**
   * Retrieves the URLSearchParams object for the current URL.
   *
   * @returns {URLSearchParams | undefined} URLSearchParams object for the current URL.
   * Returns undefined if no parameters are found.
   */
  #get(): URLSearchParams | undefined {

    try {
      const urlSearchParams = new URL( this.url, 'http://ivy.run' ).searchParams;

      return urlSearchParams.size === 0
        ? undefined
        : urlSearchParams;
    }
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
    this.#url_search_params_internal = this.#get();
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

  to_object( json: string, res: RoutingServerResponse< IncomingMessage > ): {}{

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


/****************************************************************************************
 * Represents the routing functionality for HTTP2 server responses and requests. *
 ****************************************************************************************/

/*export class RoutingHttp2ServerResponse<K extends ServerHttp2Stream> extends Http2ServerResponse {
  #bytesRead: number = 0;
  #bytesWritten: number = 0;
  #counter: 1[] = routing.get( 'counter' );
  #isRoute: boolean = false;
  #response_time: number = performance.now();
  #route: Route;
  #wrk: 0 | number = 0;
  incoming: ServerResponseIncoming = new Map();
  log: boolean = routing.get( 'log' );
  routes_active: boolean = routing.get( 'routes-active' );
  routes_path: string = routing.get( 'routes-path' );
  secure: boolean = routing.get( 'secure' );
  www_root: string = routing.get( 'www-root' );

  constructor( k: K ) {
    super( k );
  }

  #cut_user_agent( incoming_user_agent: string ): string {

    const browserRegex = /(Chrome|Firefox|Safari|Edge|Opera)\/[\d.]+/;

    const match = incoming_user_agent.match( browserRegex );

    if ( match && match[ 1 ] ) {

      return match[ 1 ];
    }
    else {

      return `${incoming_user_agent.slice( 0, 10 )}...`;
    }
  }

  #log_all_extname(): string{

    if( this.incoming.has ( 'url' ) ){
      return path.extname( this.incoming.get( 'url' ) );
    }

    this.incoming.set( 'url', '/unknown' );

    return '';
  }

  #log_color( message: string, color: string, decoration: boolean|string = false ): string{

    if( ! routing.get( 'log-color' ) ){
      return message;
    }

    if( typeof decoration === 'string' ){
      return message[ color ]()[ decoration ]();
    }

    return message[ color ]();
  }

  #log_data(): void {

    let method_section = this.#log_color( this.incoming.get( 'method' ), 'red' );
    method_section += `(${ this.#log_color( this.bytesRead.toFixed(), 'green', 'strong' ) })`;
    method_section += `(${ this.#log_color( this.bytesWritten.toFixed(), 'red', 'strong' ) })`;

    /!**
     * log format:
     * - unique id
     * - incoming method
     * - requested url
     * - status code
     * - ip address incoming
     * - hostname requested
     * - http version [http/1.1 | http/2(not supported yet)]
     * - secure [⚷ yellow | ⚷ red] -> [https | http]
     * - requests count per worker in cluster mode or total requests count in non-cluster mode
     * - wrk (id)[pid] if in cluster mode | (0)[pid] if not in cluster mode
     * - user-agent
     * - referer
     * - response time
     * - date
     * - POST|PUT|PATCH|DELETE|GET data if any
     *!/
    const message: string[] = [
      this.#log_color( this.incoming.get( 'id' ), 'b_white', 'bg_black' ),
      method_section,
      this.incoming.get( 'url' ),
      this.#log_color( this.statusCode.toString(), 'magenta' ),
      this.#log_color( this.incoming.get( 'ip_address' ), 'blue' ),
      this.#log_color( this.incoming.get( 'host' ), 'blue', 'strong' ),
      this.#log_color( this.incoming.get( 'httpVersion' ), 'red', 'underline' ),
      this.secure
        ? this.#log_color( '⚷', 'yellow', 'strong' )
        : this.#log_color( '⚷', 'red', 'strong' ),
      this.#log_color( this.#counter.length.toString(), 'cyan', 'strong' ),
      this.wrk === 0
        ? this.#log_color( `⟳ (0)[${ process.pid }]`, 'yellow' )
        : this.#log_color( `⟳ (${ this.wrk })[${ process.pid }]`, 'b_yellow' ),
      this.#log_color( this.incoming.get( 'user-agent' ), 'green' ),
      this.incoming.get( 'referer' ),
      `${ this.get_response_time().toFixed( 4 ) }ms`,
      this.#log_color( this.incoming.get( 'date' ), 'yellow' ),
      this.#log_data_request() === false
        ? ''
        : <string>this.#log_data_request()
    ];

    if( routing.get( 'log-persistent' ) ){
      process.send( { 'log': message } );
    }

    // if the control room is active, send the log to the control room.
    if( routing.get( 'control-room' ) ){
      process.send( { 'control-room': message.join( '|' ) } );
    }

    //logging the message to the console.
    process.stdout.write( `${ message.join( ' ' ) }\n` );

    if ( this.incoming.has( 'data-error' ) && this.incoming.get( 'data-error' ).length > 0 ) {
      process.stderr.write( `${this.incoming.get( 'data-error' )}\n` );
    }
    if ( this.incoming.has( 'error' ) && this.incoming.get( 'error' ).length > 0 ) {
      process.stderr.write( `${this.incoming.get( 'error' ).join( ', ' )}\n` );
    }

  }

  #log_data_incoming_check(){

    if ( ! this.incoming.has( 'error' ) || ! Array.isArray( this.incoming.get( 'error' ) ) ){
      this.incoming.set( 'error', [] );
    }

    if( ! this.incoming.has( 'request' ) ){
      this.incoming.get ( 'error' ).push( '[data] is missing.' );

      return;
    }

    if( ! this.incoming.get( 'request' ).has( 'url_params' ) ){
      this.incoming.get( 'error' ).push( '[url_params] is missing.' );
    }

    if( ! this.incoming.get( 'request' ).has( 'data' ) ){
      this.incoming.get( 'error' ).push( '[data] is missing.' );
    }
  }

  #log_data_request(): boolean|string{

    this.#log_data_incoming_check();

    const post_data: Buffer|undefined = this.incoming?.get( 'request' )?.get( 'data' );
    const get_data: URLSearchParams|undefined = this.incoming?.get( 'request' )?.get( 'url_params' );

    // todo: refactor this. It's a mess.
    const _post_data: number|object = post_data !== undefined && post_data.length > 0
      ? this.to_object( post_data.toString() )
      : 0;

    const _get_data: URLSearchParams|number = get_data !== undefined && get_data.size > 0
      ? get_data
      : 0;

    if( typeof _post_data === 'number' && typeof _get_data === 'number' ){
      return false;
    }

    const render_post_data: string = typeof _post_data === 'number'
      ? ''
      : inspect( _post_data, { colors: routing.get( 'log-color' ), depth: Infinity } );

    const render_get_data: string = typeof _get_data === 'number'
      ? ''
      : inspect( _get_data, { colors: routing.get( 'log-color' ), depth: Infinity } );

    return `${ render_post_data }${ render_get_data }`;

  }

  #virtual_routes_segments( url: string, virtual_route: string ): IVirtualRouteValidationSegments{

    const url_array = url.split( '/' ).filter( segment => segment !== '' );
    const virtual_route_array = virtual_route.split( '/' ).filter( segment => segment !== '' );

    return {
      url_segments: url_array,
      virtual_segments: virtual_route_array
    };
  }

  #virtual_routes_validation( url: string, virtual_route: string ): boolean {

    const { url_segments, virtual_segments } = this.#virtual_routes_segments( url, virtual_route );

    if ( url_segments.length !== virtual_segments.length ) {
      return false;
    }

    for ( let i = 0; i < virtual_segments.length; i ++ ) {

      if ( virtual_segments[ i ].startsWith( ':' ) ) {
        continue;
      }
      if ( url_segments[ i ] !== virtual_segments[ i ] ) {
        return false;
      }
    }

    return true;
  }

  close() {

    if ( ! this.writableEnded ) {
      this.end();
    }
  }

  end( data?: ( () => void ) | Buffer | Uint8Array | string, encoding?: ( () => void ) | BufferEncoding, callback?: () => void ): this;
  end( data?: Buffer | Uint8Array | string, encoding?: BufferEncoding, callback?: () => void ): this;
  end( data?: Uint8Array|string, encoding?: BufferEncoding, callback?: ()=>void ): this {

    super.end( data, encoding, callback );

    routing.get( 'response-time' ).set( 'end', performance.now() );

    if ( this.log ) {
      this.#counter.push( 1 );

      const file_extension = this.#log_all_extname();

      this.bytesWritten = this.bytesWritten > 0 ? this.bytesWritten : this.socket.bytesWritten;

      if ( routing.get( 'log-all' ) ) {
        this.#log_data();
      }
      else if ( file_extension === '.html' || file_extension.length === 0 ) {
        this.#log_data();
      }
    }

    // send request for the ip address to nmap. it is a standalone server maybe written in c++.

    return this;
  }

  get_response_time(): number {

    return routing.get( 'response-time' ).get( 'end' ) - this.#response_time;
  }

  /!**
   * todo: error handling for routes rejected promises and, async functions and try catch for sync functions
   * todo: probably better to specify the routes type
   * - SyncFunction
   * - AsyncFunction
   * - Promise
   * with a default export of Object|Map options.
   * this options should not be mandatory.
   *!/
  async sendRoute( IncomingMessage: RoutingHttp2IncomingMessage ): Promise<void> {

    const intenal_server_error = Buffer.from( 'Internal Server Error' );
    if ( this.route.constructor.name === 'AsyncFunction' ) {

      const response = await this.route( IncomingMessage, this );
      if ( Buffer.isBuffer( response ) ) {
        this.bytesWritten = response.length;
        this.writeHead( 200 ).end( response );
      }
      else if( response !== undefined && ! Buffer.isBuffer( response ) ){
        process.stderr.write( 'Error: AsyncFunction Routes that return instead of write|end the Buffer back to the client,\n' );
        process.stderr.write( 'must return(Buffer)\n' );
        this.bytesWritten = intenal_server_error.length;
        this.writeHead( 500 ).end( intenal_server_error );
      }
    }
    else if ( this.route instanceof Promise || this.route instanceof Function ) {

      let response = this.route( IncomingMessage, this );
      if ( response instanceof Promise ) {
        response = await response;
      }
      if ( Buffer.isBuffer( response ) ) {
        this.bytesWritten = response.length;
        this.writeHead( 200 ).end( response );
      }
      if( response !== undefined && ! Buffer.isBuffer( response ) ){
        process.stderr.write( 'Error: Routes that return instead of write|end the Buffer back to the client,\n' );
        process.stderr.write( 'and return a new Promise, must resolve(Buffer)\n' );
        this.bytesWritten = intenal_server_error.length;
        this.writeHead( 500 ).end( intenal_server_error );
      }
    }
  }

  async static( url: string ) {

    let file_requested: Error | string | string[] = url.length === 1 && url.startsWith( '/' )
      ? [ this.www_root, 'index.html' ]
      : [ this.www_root ].concat( url.split( '/' ) );

    file_requested = await path.isFile( path.resolve( ...file_requested ) )
      .catch( error => error ) as Error | string;
    if ( ! ( file_requested instanceof Error ) ) {

      const file_extension = path.basename( path.extname( file_requested ) ) as ContentTypeFileExt;
      const buffer = await readFile( file_requested );
      this.setHeader( 'Content-Type', CONTENT_TYPE.get( file_extension ) || 'text/plain' );
      this.bytesWritten = buffer.length;
      this.writeHead( 200 ).end( buffer );
    }
    else if ( routing.get( 'to-index-html' ) ) {

      let status_code: 200 | 404 = 200;

      if( routing.get( 'virtual-routes' ).length > 0 ) {

        for ( const virtual_route of routing.get( 'virtual-routes' ) ) {

          status_code = this.#virtual_routes_validation( url, virtual_route )
            ? 200
            : 404;

          if ( status_code === 200 ) {
            break;
          }
        }
      }
      const buffer = await readFile( [ this.www_root, 'index.html' ].join( '/' ) );
      this.bytesWritten = buffer.length;
      this.writeHead( status_code ).end( buffer );
    }
    else {
      const buffer = Buffer.from( '404 - Not Found' );
      this.bytesWritten = buffer.length;
      this.writeHead( 404 ).end( buffer );
    }
  }

  to_json( data: {} ): string{

    try{

      return JSON.stringify( data );
    }
    catch( error ){

      const buffer = Buffer.from( '500 - Internal Server Error' );
      process.stderr.write( `${ error.message }\n` );
      this.writeHead( 500 );
      this.bytesWritten = buffer.length;
      this.end( buffer );
    }
  }

  to_object( json: string, return_plain: boolean = true ): {}{

    try{

      return JSON.parse( json );
    }
    catch( _e ){

      const encoded = Encoding.detect( json );
      const encoding = encoded === false ? 'not detected' : ` (${ encoded })`.magenta();
      const error = `${'incoming not JSON data: '}${this.incoming.get( 'id' ).b_white().bg_black()} ${this.incoming.get( 'ip_address' ).b_red()} ${encoding}`;
      this.incoming.set( 'data-error', error );
      if ( return_plain ){
        return json;
      }

      this.writeHead( 500 );
      this.end( Buffer.from( 'internal server error' ) );
    }
  }

  user_agent( incoming_user_agent: string | undefined ): string {

    if ( incoming_user_agent === undefined ) {
      return 'Agent/Unknown';
    }

    if ( routing.get( 'cut-user-agent' ) ) {
      return this.#cut_user_agent( incoming_user_agent );
    }

    return incoming_user_agent;
  }

  get bytesRead(): number {

    return this.#bytesRead;
  }

  set bytesRead( value: number ) {

    this.#bytesRead = value;
  }

  get bytesWritten(): number {

    return this.#bytesWritten;
  }

  set bytesWritten( value: number ) {

    this.#bytesWritten = value;
  }

  set isRoute( value: boolean ) {

    this.#isRoute = value;
  }

  get isRoute(): boolean {

    return this.#isRoute;
  }

  set route( module: Route ) {

    this.#route = module;
  }

  get route(): Route {

    return this.#route;
  }

  set wrk( id: 0 | number ) {

    this.#wrk = id;
  }

  get wrk(): 0 | number {

    return this.#wrk;
  }
}*/

/**
 * Class representing a routing incoming message.
 * @extends IncomingMessage - extends the IncomingMessage class.
 */
/*export class RoutingHttp2IncomingMessage
  extends Http2ServerRequest {

  #url_internal: string;
  #url_sanitized: string;
  #url_search_params_internal: URLSearchParams | undefined;

  ip_address = undefined;
  post_data: Buffer = Buffer.alloc( 0 );
  route_module: Route;
  routes: RoutingRoute = routing.get( 'routes' );

  constructor( request: ServerHttp2Stream, headers: IncomingHttpHeaders, options?: ReadableOptions, rawHeaders?: string[] ) {
    // Call the parent class's constructor with the required arguments
    super( request, headers, options, rawHeaders );
  }

  /!**
   * Retrieves the URLSearchParams object for the current URL.
   *
   * @returns {URLSearchParams | undefined} URLSearchParams object for the current URL.
   * Returns undefined if no parameters are found.
   *!/
  #get(): URLSearchParams | undefined {

    try {
      const urlSearchParams = new URL( this.url, 'http://ivy.run' ).searchParams;

      return urlSearchParams.size === 0
        ? undefined
        : urlSearchParams;
    }
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


  /!**
   * todo - add support for HEAD
   * todo - add support for OPTIONS
   * todo - add support for TRACE
   * todo - add support for CONNECT
   * todo - add support for PATCH
   * todo - add support for PUT
   * todo - add support for DELETE
   *!/

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
    this.#url_search_params_internal = this.#get();
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

  to_object( json: string, res: RoutingHttp2ServerResponse<ServerHttp2Stream> ): {}{

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
}*/
