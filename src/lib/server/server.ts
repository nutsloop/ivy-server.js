import type { Route } from './routing.js';

import { entry_point } from '../logic.js';
import { routing } from './routing.js';

export type CreateServerOptions =
  Map<'address' | 'exec' | 'served-by' | 'www-root', string> &
  Map<'command', 'cluster' | 'spin'> &
  Map<'cpus' | 'port', number> &
  Map<'cut-user-agent' |
    'ease' |
    'ease-cluster' |
    'hot-routes' |
    'log' |
    'log-all' |
    'log-color' |
    'to-index-html', null> &
  Map<'https' | 'live-reload' | 'routes' | 'vroutes', null | string> &
  Map<'log-persistent' | 'socket', null | number>;

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

      if( options.has( 'socket' ) ){
        argv.push( `--socket${this.#null_or_option( options.get( 'socket' ) )}` );
        options.delete( 'socket' );
      }

      argv.push( options?.get( 'command' ) || 'spin' );
      options.delete( 'command' );

      if( options.size > 0 ){
        for( const [ key, value ] of options as Map<string, string> ) {
          argv.push( `--${key}${this.#null_or_option( value )}` );
        }
      }
    }

    this.argv = argv ?? [ 'spin' ];
  }

  async route( path: string, route: Route ): Promise<void> {

    return new Promise( ( resolve, reject ) => {

      const routes = routing.get( 'routes' );
      if( routes.has( path ) ){

        reject( `Route ${path} already exists` );
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

    return new Promise( ( resolve, reject ) => {

      const virtual_routes = routing.get( 'virtual-routes' );
      if( typeof path === 'string' ){

        if( virtual_routes.includes( path ) ){

          reject( `Virtual route ${path} already exists` );
        }
        else{

          virtual_routes.push( path );
          resolve();
        }
      }
      else{

        for ( const virtual_route of path ) {

          if( virtual_routes.includes( virtual_route ) ){

            reject( `Virtual route ${virtual_route} already exists` );
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
