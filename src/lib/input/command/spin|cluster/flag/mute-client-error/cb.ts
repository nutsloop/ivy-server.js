import type { CallBackFlag } from '@nutsloop/ivy-input';

import { routing } from '../../../../../server/routing.js';

export const mute_client_error_cb: CallBackFlag = (): void => {

  routing.set( 'mute-client-error', true );
};
