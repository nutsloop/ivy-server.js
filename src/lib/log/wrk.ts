#!/usr/bin/env -S node
import cluster from 'node:cluster';

process.argv.splice( 0, 2 );
process.title = `ivy-log(${ cluster.worker.id })`;

// example of data
const _data_object = {
  log_worker: true,
  counter: 1,
  worker_id: 5,
  message: [
    '92a4105e',
    'POST(150)(15)',
    '/index',
    '404',
    '127.0.0.1',
    '0.0.0.0:3001',
    'http/1.1',
    '⚷',
    '1',
    '⟳ (5)[88027]',
    'curl/8.7.1',
    'no-referer',
    '4.2422ms',
    '2025-04-03T17:41:52.753Z',
    '{ data: \'is set\' }'
  ]
};

const counter: 1[] = [];
process.on( 'message', ( data: { log_wrk:boolean, counter: number, worker_id: number, message: string[]} ) => {
  counter.push( 1 );
  if( data.worker_id !== 0 ) {
    data.message.push( `(${ data.worker_id })(${ data.counter.toString() })[${ counter.length.toString() }]` );
  }
  process.stdout.write( `${data.message.join( ' ' )}\n` );
} );
