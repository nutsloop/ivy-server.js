import { isFile, isValid } from '@nutsloop/ivy-cross-path';
import { CallBackFlagAsync } from '@nutsloop/ivy-input';
import { readFile } from 'node:fs/promises';

import { routing } from '../../../../../server/routing.js';

export const virtual_routes_cb: CallBackFlagAsync = async ( data: string ): Promise<void> => {

  const absolute_path = await isValid( ...[ process.cwd(), data || 'vroutes' ] )
    .catch( error => error );

  if ( absolute_path instanceof Error ) {
    throw new Error( `--virtual-routes path: [${absolute_path.message.red()}] is not valid.` );
  }

  const virtual_routes_file = await isFile( `${absolute_path}/.virtual-routes` )
    .catch( error => error );

  if( virtual_routes_file instanceof Error ) {
    throw new Error( `--virtual-routes path to file descriptor: [${virtual_routes_file.message.red()}] is not valid.` );
  }

  let virtual_routes: string | string[] = await readFile( virtual_routes_file, { encoding: 'utf-8' } );
  if( virtual_routes.length === 0 ) {

    let message = `descriptor file must be filled with at least one virtual route.\n`;
    message += `one route per line.\n`;
    message += `example:\n`;
    message += `  /home\n`;
    message += `  /about`;

    throw new Error( `--virtual-routes: [${virtual_routes_file}] is empty.\n ${message}` );
  }

  virtual_routes = virtual_routes.split( '\n' );

  routing.set( 'virtual-routes', virtual_routes );
};
