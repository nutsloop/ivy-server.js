import { CallBackFlag } from '@ivy-industries/input';

import { routing } from '../../../../../server/routing.js';

export const cut_user_agent_cb: CallBackFlag = (): void => {

  routing.set( 'cut-user-agent', true );
};
