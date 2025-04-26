import { CallBackFlagAsync } from '@nutsloop/ivy-input';

import { routing } from '../../../../../server/routing.js';

export const log_persistent_cb: CallBackFlagAsync = async (): Promise<void> => {

  routing.set( 'log-persistent', true );
};
