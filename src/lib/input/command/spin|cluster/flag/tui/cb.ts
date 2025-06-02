import { CallBackFlag } from '@nutsloop/ivy-input';

import { routing } from '../../../../../server/routing.js';

export const tui_cb: CallBackFlag = (): void => {

  //@ts-expect-error @allowed
  routing.set( 'tui', true );
};
