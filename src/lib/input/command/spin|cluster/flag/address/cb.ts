import type { CallBackFlag } from '@nutsloop/ivy-input';

import { routing } from '../../../../../server/routing.js';

export const address_cb: CallBackFlag = ( address: string ): void => {

  routing.set( 'address', address );
};
