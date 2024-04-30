import type { CallBackFlagAsync } from '@ivy-industries/input';

import { isValid } from '@ivy-industries/cross-path';

import { routing } from '../../../../../server/routing.js';

export const routes_cb: CallBackFlagAsync = async ( data: string ): Promise<void> => {

  const absolute_path = await isValid( ...[ process.cwd(), data || 'routes' ] )
    .catch( error => error );

  if( absolute_path instanceof Error ) {
    throw new Error( `--routes path: [${ absolute_path.message.red() }] is not valid.` );
  }

  routing.set( 'routes-active', true );
  routing.set( 'routes-path', absolute_path );
};
