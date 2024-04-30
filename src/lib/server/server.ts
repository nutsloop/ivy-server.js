import type { Route } from './routing.js';

import { entry_point } from '../logic.js';
import { routing } from './routing.js';

/**
 * todo: finish the documentation.
 *       - add the rest of the methods.
 *       - add the rest of the properties and options.
 *       - add the rest of the types.
 *       - must comply with the cli version of ivy-server.
 */
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
  Map<'https' | 'live-reload' | 'routes', null | string> &
  Map<'log-persistent' | 'socket', null | number> &
  Map<'virtual-routes', string>;

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

    // todo: handle cluster.
    // todo: and handle already clustered.
    const argv: string[] = [];

    if( options?.has( 'ease' ) ){
      argv.push( '--ease' );
    }
    if( options?.has( 'ease-cluster' ) ){
      argv.push( '--ease-cluster' );
    }
    if( options?.has( 'socket' ) ){
      const socket = options.get( 'socket' );
      argv.push( `--socket${socket === null ? '' : `=${socket}`}` );
    }
    options?.delete( 'ease' );
    options?.delete( 'ease-cluster' );
    options?.delete( 'socket' );

    argv.push( options?.get( 'command' ) || 'spin' );
    options?.delete( 'command' );

    if( options ) {

      for( const [ key, value ] of options as Map<string, string> ) {
        const isVoid = value === null ? '' : `=${value}`;
        argv.push( `--${key}${isVoid}` );
      }
    }

    this.argv = argv;
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
