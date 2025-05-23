import type { CallBackFlagAsync } from '@nutsloop/ivy-input';

import { isFile } from '@nutsloop/ivy-cross-path';

import { routing } from '../../../../../server/routing.js';

export const exec_cb: CallBackFlagAsync<string> = async ( data: string ): Promise<void> => {

  const absolute_path = await isFile( data )
    .catch( error => error );

  if( absolute_path instanceof Error ) {
    throw new Error( `--exec path: [${ absolute_path.message.red() }] is not valid.` );
  }

  routing.set( 'exec', absolute_path );
};
