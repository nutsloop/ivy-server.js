import { Path } from '@ivy-industries/cross-path';
import cluster from 'node:cluster';
import { readFile } from 'node:fs/promises';
import { ServerResponse } from 'node:http';
import { inspect } from 'node:util';

import type { RoutingIncomingMessage } from './routing-incoming-message.js';

import { CONTENT_TYPE, type ContentTypeFileExt } from '../response/content-type.js';
import { generate_id, type RequestData, type Route, routing } from '../routing.js';

const path = new Path();

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
export class RoutingServerResponse<K extends RoutingIncomingMessage>
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
  redirect: boolean = false;
  redirect_to: string = '';
  multi_domain: boolean = false;
  log: boolean = routing.get( 'log' );
  routes_active: boolean = routing.get( 'routes-active' );
  routes_path: string = routing.get( 'routes-path' );
  secure: boolean = routing.get( 'secure' );
  www_root: string = routing.get( 'www-root' );

  constructor( ...args: ConstructorParameters<typeof ServerResponse> ) {
    super( ...args as ConstructorParameters<typeof ServerResponse<K>> );
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

      if( typeof message !== 'string' ){
        process.stderr.write( 'Error: log-color is false but the message is not a string.\n' );
        process.stderr.write( `Message: ${ inspect( message, { colors: false, depth: Infinity } ) }\n` );
        //process.stderr.write( `RoutingServerResponse: ${ inspect( this, { colors: routing.get( 'log-color' ), depth: Infinity } ) }\n` );
      }

      return typeof message !== 'string' ? '!string' : message;
    }

    if( typeof message !== 'string' ){

      if( typeof message !== 'string' ){
        process.stderr.write( 'Error: log-color is false but the message is not a string.\n' );
        process.stderr.write( `Message: ${ inspect( message, { colors: true, depth: Infinity } ) }\n` );
        //process.stderr.write( `RoutingServerResponse: ${ inspect( this, { colors: routing.get( 'log-color' ), depth: Infinity } ) }\n` );
      }

      return '!string'.red();
    }

    if( typeof decoration === 'string' ){
      return message[ color ]()[ decoration ]();
    }

    return message[ color ]();
  }
  async set_request_data(): Promise<void> {

    const data: RequestData = new Map();
    data.set( 'url_params', this.req.get() );
    data.set( 'data', await this.req.post() );
    this.incoming.set( 'request', data );
  }

  get_request_data(): RequestData {

    return this.incoming.get( 'request' );
  }

  async #log_data(): Promise<void> {

    this.wrk = cluster.worker?.id || 0;
    this.req.set_ip_address();
    this.bytesRead = this.req.socket.bytesRead;
    this.incoming.set( 'data-error', '' );
    this.incoming.set( 'id', await generate_id() );
    this.incoming.set( 'ip_address', this.req.ip_address );
    this.incoming.set( 'method', this.req.method );
    this.incoming.set( 'url', this.req.url || 'unknown' );
    this.incoming.set( 'httpVersion', `http/${this.req.httpVersion}` );
    this.incoming.set( 'host', this.req.headers.host || <string>this.req.headers[ ':authority' ] || 'UNKNOWN HOST' );
    this.incoming.set( 'user-agent', this.user_agent( this.req.headers[ 'user-agent' ] ) );
    this.incoming.set( 'referer', this.req.headers.referer || 'no-referer' );
    this.incoming.set( 'date', new Date().toISOString() );

    // checking the logging issue
    /*not set*/let method_section = this.#log_color( this.incoming.get( 'method' ), 'red' );
    /*set*/method_section += `(${ this.#log_color( this.bytesRead.toFixed(), 'green', 'strong' ) })`;
    /*set*/method_section += `(${ this.#log_color( this.bytesWritten.toFixed(), 'red', 'strong' ) })`;

    /**
     * log format:
     * - unique id
     * - incoming method
     * - i/o data size
     * - requested url
     * - status code
     * - ip address incoming
     * - hostname requested
     * - http version [http/1.1 | http/2(not supported yet)]
     * - secure [⚷ yellow | ⚷ red] -> [https | http]
     * - requests count per worker in cluster mode or total requests count in non-cluster mode
     * - like promise issue...⟳
     * - wrk (id)[pid] if in cluster mode | (0)[pid] if not in cluster mode
     * - user-agent
     * - referer
     * - response time
     * - date
     * - POST|PUT|PATCH|DELETE|GET data if any
     */
    // !string !string(0)(117)  /unknown 400 !string      !string     !string  ⚷ 859 ⟳ (0)[4029551] !string                  0.1781ms !string
    // 3754cd19 GET   (67)(276) /        301 91.4.175.223 89.168.29.7 http/1.0 ⚷ 389 ⟳ (1)[4029550] Agent/Unknown no-referer 0.5329ms 2025-03-28T04:38:35.991Z
    const message: string[] = [
      /*not set*/this.#log_color( this.incoming.get( 'id' ), 'b_white', 'bg_black' ),
      /*partially set*/method_section,
      /*set*/this.incoming.get( 'url' ),
      /*set*/this.#log_color( this.statusCode.toString(), 'magenta' ),
      /*not set*/this.#log_color( this.incoming.get( 'ip_address' ), 'blue' ),
      /*not set*/this.#log_color( this.incoming.get( 'host' ), 'blue', 'strong' ),
      /*not set*/this.#log_color( this.incoming.get( 'httpVersion' ), 'red', 'underline' ),
      /*set*/this.secure
        ? this.#log_color( '⚷', 'yellow', 'strong' )
        : this.#log_color( '⚷', 'red', 'strong' ),
      /*set*/this.#log_color( this.#counter.length.toString(), 'cyan', 'strong' ),
      /*set*/this.wrk === 0
        ? this.#log_color( `⟳ (0)[${ process.pid }]`, 'yellow' )
        : this.#log_color( `⟳ (${ this.wrk })[${ process.pid }]`, 'b_yellow' ),
      /*set*/this.#log_color( this.incoming.get( 'user-agent' ), 'green' ),
      /*not set but empty?*/this.incoming.get( 'referer' ),
      /*set*/`${ this.get_response_time().toFixed( 4 ) }ms`,
      /*not set*/this.#log_color( this.incoming.get( 'date' ), 'yellow' ),
      /*set*/this.#log_data_request() === false
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

    if( this.redirect === true ){}
    if( this.listener_error === false ){}

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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    catch( error ){

      const error_message = `incoming not JSON data: ${this.incoming.get( 'id' ).b_white().bg_black()} ${this.incoming.get( 'ip_address' ).b_red()}`;
      this.incoming.set( 'data-error', error_message );
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
