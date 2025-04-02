import { CallBackFlag } from '@nutsloop/ivy-input';

import { routing } from '../../../../../server/routing.js';

// TODO: removing this flag and logging every file requested.
export const log_all_cb: CallBackFlag = (): void => {

  // TODO: removing this entry in the routing Map
  routing.set( 'log-all', true );
  routing.set( 'log', true );
};
