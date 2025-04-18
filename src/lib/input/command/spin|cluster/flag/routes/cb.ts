import type { CallBackFlagAsync } from '@nutsloop/ivy-input';

import { isValid, parse, resolve } from '@nutsloop/ivy-cross-path';
import { readdir } from 'fs/promises';

import { routing, RoutingRoute } from '../../../../../server/routing.js';

type RoutesSettings =
  Map<'path', null | string> &
  Map<'pre-load', true>;

export const routes_cb: CallBackFlagAsync<RoutesSettings | string> = async ( data: RoutesSettings | string ): Promise<void> => {

  const process_cwd = process.cwd();
  let path: string = typeof data === 'string' ? data : 'routes';
  let pre_load = false;

  if ( data instanceof Map ) {
    if( routing.get( 'hot-routes' ) ){
      throw new Error( `\n   ${'--routes'.magenta()} pre-loaded are incompatible with ${'--hot-routes'.yellow()}.\n   ${'btw'.red()}.` );
    }
    check_routes_kvp( data );
    path = data.get( 'path' ) || 'routes';
    pre_load = true;
  }

  const absolute_path = await isValid( ...[ process_cwd, path ] )
    .catch( error => error );

  if( absolute_path instanceof Error ) {
    throw new Error( `--routes path: [${ absolute_path.message.red() }] is not valid.` );
  }

  if( pre_load ){
    await recursive_routes( absolute_path, process_cwd, path );
  }

  routing.set( 'routes-active', true );
  routing.set( 'routes-path', absolute_path );
};

function check_routes_kvp( data: RoutesSettings ):void {

  const error: string[] = [];
  const valid: string[] = [];

  if( data.has( 'path' ) ){
    valid.push( 'path' );
  }
  else{
    error.push( 'path' );
  }

  if( data.has( 'pre-load' ) ){
    valid.push( 'pre-load' );
  }
  else{
    error.push( 'pre-load' );
  }

  if( error.length > 0 ){
    process.stderr.write( `--routes kvp key(s) [${ error.join( ' ' ).red() }] are not valid.\n` );
    if( valid.length > 0 ){
      process.stderr.write( `--routes kvp key(s) [${ valid.join( ' ' ).green() }] are valid.\n` );
    }
    process.exit( 1 );
  }

  const pre_load = data.get( 'pre-load' );
  if( pre_load !== true && typeof pre_load !== 'boolean' ){
    process.stderr.write( `--routes kvp 'pre-load' key must be set to true.\n` );
    process.exit( 1 );
  }

  const path = data.get( 'path' );
  if( path !== null && typeof path !== 'string' ){
    process.stderr.write( `--routes kvp 'path' key must be a string or null.\n` );
    process.exit( 1 );
  }

}

async function recursive_routes( absolute_path: string, process_cwd: string, routes_path: string ): Promise<void> {

  const read_dir = await readdir( absolute_path, { withFileTypes: true } );

  if( read_dir.length === 0 ){
    process.stderr.write( `--routes path: [${ absolute_path.red() }] is empty.\n` );
    process.exit( 1 );
  }

  for ( const dirent of read_dir ) {
    if( dirent.isDirectory() ){
      await recursive_routes( `${ absolute_path }/${ dirent.name }`, process_cwd, routes_path );
    }
    else if( dirent.isFile() ){

      const filename = `${absolute_path}/${dirent.name}`;
      const base_route_path = filename
        .replace( `${process_cwd}/`, '' )
        .replace( routes_path, '' );
      const route_path = resolve( `${parse( base_route_path ).dir}`, `${parse( base_route_path ).name}` );
      const routes = routing.get( 'routes' ) as RoutingRoute;

      if( routes.has( route_path ) ){
        process.stderr.write( `Route [${ route_path.red() }] already exists.\n` );
        process.exit( 1 );
      }
      else{

        routes.set( route_path, await import( filename ) );

      }
    }

  }
}
