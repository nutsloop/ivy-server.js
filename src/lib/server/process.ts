import { type Worker } from 'node:cluster';

import { routing } from './routing.js';

export function process_listener( _Worker: Worker, data: { log_worker:boolean, counter: number, worker_id: number, message: string[]} ) {
  if( data?.log_worker ){
    const log_worker = routing.get( 'log_worker' );
    if( log_worker ) {
      log_worker.send( data );
    }
  }
}
