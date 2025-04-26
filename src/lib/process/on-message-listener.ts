import { type Worker } from 'node:cluster';

import { routing } from '../server/routing.js';

export function on_message_listener( _Worker: Worker, data: { log_worker:boolean, counter: number, worker_id: number, message: string[]} ) {
  if( data?.log_worker ){
    const log_worker = routing.get( 'log_worker' );
    if( log_worker ) {
      log_worker.send( data );
    }
  }
}
