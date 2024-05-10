import { Path } from '@ivy-industries/cross-path';
import cluster from 'node:cluster';

import { OfMessage } from './thread/worker.js';

const path = new Path();

export interface ControlRoomConfig{
  hostname: string;
  port: number;
}

const worker_pid = [];

export async function control_room( control_room_config_file_path: string ): Promise<void> {

  const ivy_control_room_worker = [
    path.dirname( new URL( import.meta.url ).pathname ),
    'thread',
    'worker.js'
  ];

  cluster.setupPrimary( {
    args: [ control_room_config_file_path ],
    exec: path.resolve( ...ivy_control_room_worker )
  } );

  worker_pid.push( cluster.fork().process.pid );

  cluster.on( 'exit', ( _Worker, _code, _signal ) => {
    if( worker_pid.includes( _Worker.process.pid ) ){
      process.stdout.write( ` ${'|'.red()}${'   log'.red().underline()}(${ _Worker.id }) ${_Worker.process.pid} ${'exited'.red()}\n` );
      worker_pid.splice( worker_pid.indexOf( _Worker.process.pid ), 1 );
      worker_pid.push( cluster.fork().process.pid );
    }
  } );

  cluster.on( 'listening', ( _Worker, _address ) => {} );
  cluster.on( 'fork', ( _Worker ) => {} );
  cluster.on( 'online', ( _Worker ) => {} );
  cluster.on( 'disconnect', ( _Worker ) => {} );
  cluster.on( 'message', ( _Worker, _message: OfMessage, _Handle ) => {

    for( const wrk of Object.values( cluster.workers ) ){
      if( worker_pid.includes( wrk.process.pid ) ){
        wrk.send( _message );
      }
    }
  } );

  // ping the worker every second.
  // the worker (./thread/worker.js) will the send to the socket client the heap usage.
  setInterval( () => {
    const control_room_workers = [];
    for( const worker of Object.values( cluster.workers ) ){
      if( worker_pid.includes( worker.process.pid ) ){
        control_room_workers.push( worker );
      }
    }
    // sendig the heap usage of the worker
    control_room_workers[ 0 ].send( { 'control-room': 'heap-usage-self' } );

    // sending also the ram usage of the main server
    control_room_workers[ 0 ].send( { 'control-room':{
      heap_usage: {
        heap: {
          id: 0,
          pid: process.pid,
          usage: Number( ( process.memoryUsage().rss / ( 1024 * 1024 ) ).toFixed( 2 ) ),
          wrk: 'server-main'
        }
      }
    } } );
  }, 1000 );
}
