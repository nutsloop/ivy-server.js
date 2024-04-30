import type { CallBackFlag } from '@ivy-industries/input';

import { routing } from '../../../../../server/routing.js';

export const address_cb: CallBackFlag = ( address: string ): void => {

  routing.set( 'address', address );
};
