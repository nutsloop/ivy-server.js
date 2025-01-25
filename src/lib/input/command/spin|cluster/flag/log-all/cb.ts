import { CallBackFlag } from '@nutsloop/ivy-input';

import { routing } from '../../../../../server/routing.js';

export const log_all_cb: CallBackFlag = (): void => {

  routing.set( 'log-all', true );
  routing.set( 'log', true );
};
