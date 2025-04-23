import { routing } from '../../../../../server/routing.js';

export const socket_cb = async (): Promise<void> => {

  routing.set( 'socket', true );
};
