import { CallBackFlag } from '@ivy-industries/input';

import { routing } from '../../../../../server/routing.js';

export const log_cb: CallBackFlag = (): void => {

  routing.set( 'log', true );
};
