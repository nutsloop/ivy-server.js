import type { CallBackGlobalFlagAsync } from '@nutsloop/ivy-input';

import { routing } from '../../../../../server/routing.js';

export const control_room_cb: CallBackGlobalFlagAsync = async (): Promise<void> => {

  routing.set( 'control-room', true );
};
