import { CallBackFlag } from '@ivy-industries/input';

import { routing } from '../../../../../server/routing.js';

export const hot_routes_cb: CallBackFlag = (): void => {

  routing.set( 'hot-routes', true );
};
