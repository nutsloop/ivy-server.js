import type { CallBackFlagAsync } from '@nutsloop/ivy-input';

import { isValid } from '@ivy-industries/cross-path';

import { routing } from '../../../../../server/routing.js';

export const www_root_cb: CallBackFlagAsync = async ( data: string ): Promise<void> => {

  const absolute_path = await isValid( data )
    .catch( error => error );

  if( absolute_path instanceof Error ) {
    throw new Error( `--www-root path: [${ absolute_path.message.red() }] is not valid.` );
  }

  routing.set( 'www-root', absolute_path );
};
