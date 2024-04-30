import type { CallBackFlag, CallBackFlagArgvData } from '@ivy-industries/input';

import { routing } from '../../../../../server/routing.js';

type https_cb_data = Map<keyType, string>
type keyType = 'cert' | 'dhparam' | 'key';

export const https_cb: CallBackFlag = ( data: CallBackFlagArgvData<https_cb_data>, key: 'key', cert: 'cert', dhparam: 'dhparam' ): void => {

  const kvp_keys_allowed: keyType[] = [ key, dhparam, cert ];
  if ( data !== null ) {

    const missingKeys: keyType[] = [];
    const validKeys: keyType[] = [];

    for ( let i = 0; i < kvp_keys_allowed.length; i ++ ) {

      if ( ! data.has( kvp_keys_allowed[ i ] ) ) {

        missingKeys.push( kvp_keys_allowed[ i ] );
      }
      else {

        validKeys.push( kvp_keys_allowed[ i ] );
      }
    }

    if ( missingKeys.length > 0 ) {

      throw new Error( `the secure server couldn't start because of wrong flag options.
  ● Missing keys: ${missingKeys.join( ', ' ).red()}
  ● Valid keys: ${validKeys.join( ', ' ).green()}` );
    }
  }

  routing.set( 'secure', true );
};
