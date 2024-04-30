import type { CallBackGlobalFlag } from '@ivy-industries/input';

import { routing } from '../../../../../server/routing.js';

export const ease_cb: CallBackGlobalFlag = (): void => {

  routing.set( 'ease', true );
};
