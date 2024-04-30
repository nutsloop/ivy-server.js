import type { CallBackGlobalFlag } from '@ivy-industries/input';

import { routing } from '../../../../../server/routing.js';

export const ease_cluster_cb: CallBackGlobalFlag = (): void => {

  routing.set( 'ease-cluster', true );
};
