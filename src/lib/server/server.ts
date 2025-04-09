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

  #null_or_option( value: null|number|string ): string{
    return value === null ? '' : `=${value}`;
  }

  /**
   * Creates a server with the given options.
   */
  create( options?: CreateServerOptions ): void {

    let argv: null|string[] = null;

    if( options instanceof Map && options.size > 0 ) {

      argv = [];

      if( options.has( 'ease' ) ){
        argv.push( '--ease' );
        options.delete( 'ease' );
      }

      if( options.has( 'ease-cluster' ) ){
        argv.push( '--ease-cluster' );
        options.delete( 'ease-cluster' );
      }

      argv.push( options?.get( 'command' ) || 'spin' );
      options.delete( 'command' );

      if( options.size > 0 ){

        for( const [ key, value ] of options as Map<string, Map<string, string> | string> ) {

          if( value instanceof Map ){

            let kvp = '!';
            for( const [ k, v ] of value ){
              kvp += `${k}:${v}|`;
            }

            if( kvp.endsWith( '|' ) ){
              kvp = kvp.slice( 0, - 1 );
            }

            argv.push( `--${key}=${kvp}` );
          }
          else{
            argv.push( `--${key}${this.#null_or_option( value )}` );
          }

        }
      }
    }

    this.argv = argv ?? [ 'spin' ];
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

    await entry_point( this.argv ).catch( console.error );
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

  set argv( argv: string[] ){

    this.#argv.push( ...argv );
  }

  get argv(): string[]{

    return this.#argv;
  }
}

export class IvyServer extends BaseServer{}
