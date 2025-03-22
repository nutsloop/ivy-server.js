import type { CallBackFlag } from '@nutsloop/ivy-input';

import { routing } from '../../../../../server/routing.js';

export const redirect_to_https_cb: CallBackFlag = (): void => {

  routing.set( 'redirect-to-https', true );
};
