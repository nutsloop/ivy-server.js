import type { CallBackFlagAsync } from '@ivy-industries/input';

import { routing } from '../../../../../server/routing.js';

export const served_by_cb: CallBackFlagAsync = async ( data: string ): Promise<void> => {

  routing.set( 'served-by-name', data );
  routing.set( 'served-by', true );
};
