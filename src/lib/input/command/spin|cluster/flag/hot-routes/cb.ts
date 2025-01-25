import { CallBackFlag } from '@nutsloop/ivy-input';

import { routing } from '../../../../../server/routing.js';

export const hot_routes_cb: CallBackFlag = (): void => {

  routing.set( 'hot-routes', true );
};
