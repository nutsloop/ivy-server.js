import { CallBackFlag } from '@ivy-industries/input';

import { routing } from '../../../../../server/routing.js';

export const log_color_cb: CallBackFlag = (): void => {

  routing.set( 'log-color', true );
};
