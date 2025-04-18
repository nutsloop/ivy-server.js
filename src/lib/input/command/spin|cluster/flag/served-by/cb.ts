import type { CallBackFlagAsync } from '@nutsloop/ivy-input';

import { routing } from '../../../../../server/routing.js';

export const served_by_cb: CallBackFlagAsync<string> = async ( data: string ): Promise<void> => {

  routing.set( 'served-by-name', data );
  routing.set( 'served-by', true );
};
