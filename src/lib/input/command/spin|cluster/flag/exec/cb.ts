import type { CallBackFlagAsync } from '@nutsloop/ivy-input';

import { isFile } from '@ivy-industries/cross-path';

import { routing } from '../../../../../server/routing.js';

export const exec_cb: CallBackFlagAsync = async ( data: string ): Promise<void> => {

  const absolute_path = await isFile( data )
    .catch( error => error );

  if( absolute_path instanceof Error ) {
    throw new Error( `--exec path: [${ absolute_path.message.red() }] is not valid.` );
  }

  routing.set( 'exec', absolute_path );
};
