import type { CallBackGlobalFlagAsync } from '@ivy-industries/input';

import { routing } from '../../../../../server/routing.js';

export const control_room_cb: CallBackGlobalFlagAsync = async (): Promise<void> => {

  routing.set( 'control-room', true );
};
