import type { CallBackFlag } from '@nutsloop/ivy-input';

import { routing } from '../../../../../server/routing.js';

export const acme_challenge_cb: CallBackFlag = (): void => {

  routing.set( 'acme-challenge', true );
};
