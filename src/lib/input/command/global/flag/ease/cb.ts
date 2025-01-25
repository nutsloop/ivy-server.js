import type { CallBackGlobalFlag } from '@nutsloop/ivy-input';

import { routing } from '../../../../../server/routing.js';

export const ease_cb: CallBackGlobalFlag = (): void => {

  routing.set( 'ease', true );
};
