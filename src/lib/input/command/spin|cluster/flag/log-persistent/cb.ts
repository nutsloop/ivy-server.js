import { CallBackFlagAsync } from '@nutsloop/ivy-input';
import { cpus } from 'node:os';

import { routing } from '../../../../../server/routing.js';

export const log_persistent_cb: CallBackFlagAsync = async ( threads?: number ): Promise<number> => {

  routing.set( 'log-persistent', true );

  return threads || cpus().length;
};
