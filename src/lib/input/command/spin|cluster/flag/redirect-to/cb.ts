import type { CallBackFlag } from '@nutsloop/ivy-input';

import { routing } from '../../../../../server/routing.js';

export const redirect_to_cb: CallBackFlag = ( data: string ): void => {

  if( data.startsWith( 'http://' ) && data.startsWith( 'https://' ) ) {
    process.stderr.write( `  redirect url must NOT start with 'http://' or 'https://'.\n  the protocol will be added automatically.` );
    process.stderr.write( 'just pass the base domain name. like: redirect everything to domain.com' );
    process.exit( 127 );
  }

  if( data.endsWith( '/' ) ) {
    process.stderr.write( `  redirect url must NOT end with '/'.\n` );
    process.stderr.write( 'just pass the base domain name. like: redirect everything to domain.com or www.domain.com' );
    process.exit( 127 );
  }

  routing.set( 'redirect', data.endsWith( '/' ) ? data.slice( 0, - 1 ) : data );
};
