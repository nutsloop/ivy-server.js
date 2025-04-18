import type { CallBackFlagAsync } from '@nutsloop/ivy-input';

import { routing } from '../../../../../server/routing.js';

export const live_reload_cb: CallBackFlagAsync = async (): Promise<void> => {
  routing.set( 'live-reload', true );
};
