import type { CallBackFlagAsync } from '@nutsloop/ivy-input';

import { cpus } from 'node:os';

import { routing } from '../../../../../server/routing.js';

export const socket_cb: CallBackFlagAsync<number> = async ( threads?: number ): Promise<number> => {

  routing.set( 'socket', true );

  return threads || cpus().length;
};
