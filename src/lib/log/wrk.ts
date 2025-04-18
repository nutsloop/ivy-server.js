#!/usr/bin/env -S node
import cluster from 'node:cluster';

// Ensure we're in a worker context
if ( ! cluster.worker ) {
  console.error( 'This script must be run as a worker process' );
  process.exit( 1 );
}

process.argv.splice( 0, 2 );
process.title = `ivy-log(${ cluster.worker.id })`;

const counter: 1[] = [];
process.on( 'message', ( data: { log_wrk:boolean, counter: number, worker_id: number, message: string[]} ) => {
  counter.push( 1 );
  if( data.worker_id !== 0 ) {
    data.message.push( `(${ data.worker_id })(${ data.counter.toString() })[${ counter.length.toString() }]` );
  }
  process.stdout.write( `${data.message.join( ' ' )}\n` );
} );
