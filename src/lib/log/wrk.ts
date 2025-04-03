#!/usr/bin/env -S node
import cluster from 'node:cluster';

process.argv.splice( 0, 2 );
process.title = `ivy-log(${ cluster.worker.id })`;

const counter: 1[] = [];
process.on( 'message', ( data: { log_wrk:boolean, counter: number, worker_id: number, message: string[]} ) => {
  counter.push( 1 );
  process.stdout.write( `${data.message.join( ' ' )}` );
  if( data.worker_id !== 0 ) {
    process.stdout.write( `(${ data.worker_id })(${ data.counter.toString() })[${ counter.length.toString() }]\n` );
  }
} );
