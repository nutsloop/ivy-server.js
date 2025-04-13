import { extends_proto } from '@nutsloop/ivy-ansi';

import type { Route } from './routing.js';

import { entry_point } from '../logic.js';
import { routing } from './routing.js';

extends_proto();

/**
 * Abstraction layer Type of the cli commands|options server.
 */
export type CreateServerOptions =
  Map<'address' | 'exec' | 'redirect' | 'served-by' | 'www-root', string> &
  Map<'command', 'cluster' | 'spin'> &
  Map<
    'acme-challenge' |
    'mute-client-error' |
    'control-room' |
    'cut-user-agent' |
    'ease' |
    'ease-cluster' |
    'hot-routes' |
    'log' |
    'log-color' |
    'redirect-to-https' |
    'to-index-html', null> &
  Map<'cpus' | 'port', number> &
  Map<'https' | 'live-reload' | 'multi-domain' | 'vroutes', null | string> &
  Map<'log-persistent' | 'socket', null | number> &
  Map<'routes', Map<string, string> | null | string>;

type IteratorArgv = IterableIterator<
  [
      | 'address'
      | 'exec'
      | 'redirect'
      | 'served-by'
      | 'www-root'
      | 'command'
      | 'acme-challenge'
      | 'mute-client-error'
      | 'control-room'
      | 'cut-user-agent'
      | 'ease'
      | 'ease-cluster'
      | 'hot-routes'
      | 'log'
      | 'log-color'
      | 'redirect-to-https'
      | 'to-index-html'
      | 'cpus'
      | 'port'
      | 'https'
      | 'live-reload'
      | 'multi-domain'
      | 'vroutes'
      | 'log-persistent'
      | 'socket'
      | 'routes',
      null | number | string | Map<string, string>
  ]
>;
/**
 * The Ivy-Server interface.
 */
export interface IServer{
  create( options?: CreateServerOptions ): void;
  route( path: string, route: Route ): Promise<void>;
  start(): Promise<void>;
  virtual_routes( path: string | string[] ): Promise<void>;
}

/**
 * Represents a base server implementation.
 * @implements {IServer}
 */
class BaseServer implements IServer{

  #argv: string[] = [];
  constructor() {/**/}

  /**
   * Creates a server with the given options.
   */
  create( options?: CreateServerOptions ): void {

    if( options && ! ( options instanceof Map ) ){
      throw new TypeError( 'options must be a Map instance' );
    }

    if( ! options || options.size === 0 ){
      this.#argv.push( 'spin' );

      return;
    }

    const global_flags: string[] = [];
    for( const flag of [ 'ease', 'ease-cluster' ] as const ){
      if( options.has( flag ) ){
        global_flags.push( `--${flag}` );
        options.delete( flag );
      }
    }

    const command = options.get( 'command' ) || 'spin';
    options.delete( 'command' );

    const args: string[] = Array.from( options.entries() as IteratorArgv ).map( ( [ key, value ] ) => {

      if( value === null ) {
        return `--${key}`;
      }

      if( value instanceof Map ){
        const kvp = Array.from( value ).map( ( [ k, v ] ) => `${k}:${v}` ).join( '|' );

        return `--${key}=!${kvp}`;
      }

      return `--${key}=${value}`;
    } );

    this.#argv.push( ...global_flags, command, ...args );
  }

  /**
   * Routes a path to a route.
   */
  async route( path: string, route: Route ): Promise<void> {

    return new Promise( ( resolve, _reject ) => {

      const routes = routing.get( 'routes' );
      if( routes.has( path ) ){

        process.stderr.write( `Route [${path.red()}] already exists\n` );
        process.exit( 1 );
      }
      else{

        routes.set( path, route );
        resolve();
      }
    } );
  }

  async start(): Promise<void> {

    await entry_point( this.#argv, true ).catch( ( error ) => {
      console.error( '[server] fatal error:', error );
      process.exit( 1 );
    } );
  }

  async virtual_routes( path: string | string[] ): Promise<void>{

    return new Promise( ( resolve, _reject ) => {

      const virtual_routes = routing.get( 'virtual-routes' );
      if( typeof path === 'string' ){

        if( virtual_routes.includes( path ) ){

          process.stderr.write( `Virtual route [${path.red()}] already exists\n` );
          process.exit( 1 );
        }
        else{

          virtual_routes.push( path );
          resolve();
        }
      }
      else{

        for ( const virtual_route of path ) {

          if( virtual_routes.includes( virtual_route ) ){

            process.stderr.write( `Virtual route [${virtual_route.red()}] already exists\n` );
            process.exit( 1 );
          }
          else{

            virtual_routes.push( virtual_route );
            resolve();
          }
        }
      }
    } );
  }
}

export class IvyServer extends BaseServer{}
