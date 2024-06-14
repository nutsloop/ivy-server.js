import type { ServerOpts, Socket } from 'node:net';
import type { TLSSocket, TlsOptions } from 'node:tls';

import { Path } from '@ivy-industries/cross-path';
import cluster from 'node:cluster';

import { routing } from '../server/routing.js';

const path = new Path();

export interface SocketConfig{
  hostname: string;
  listener: ( socket: Socket & TLSSocket ) => Promise<void> | void;
  port: number;
  socketOptions?: ServerOpts | TlsOptions;
  socketPath?: string;
  type: 'sock' | 'tls';
}

const worker_pid = [];

export async function socket( socket_config_path: string, threads?: number ): Promise<void> {

  const ivy_socket_worker = [
    path.dirname( new URL( import.meta.url ).pathname ),
    'thread',
    'worker.js'
  ];

  cluster.setupPrimary( {
    args: [ socket_config_path, routing.get( 'control-room' ).toString() ],
    exec: path.resolve( ...ivy_socket_worker )
  } );

  for ( let i = 0; i < threads; i ++ ) {
    worker_pid.push( cluster.fork().process.pid );
  }

  cluster.on( 'exit', ( _Worker, _code, _signal ) => {
    if( worker_pid.includes( _Worker.process.pid ) ){
      process.stdout.write( ` ${'|'.red()}${'   soc'.red().underline()}(${ _Worker.id }) ${_Worker.process.pid} ${'exited'.red()}\n` );
      worker_pid.splice( worker_pid.indexOf( _Worker.process.pid ), 1 );

      cluster.setupPrimary( {
        args: [ socket_config_path, routing.get( 'control-room' ).toString() ],
        exec: path.resolve( ...ivy_socket_worker )
      } );

      worker_pid.push( cluster.fork().process.pid );
    }
  } );

  cluster.on( 'listening', ( _Worker, _address ) => {} );
  cluster.on( 'fork', ( _Worker ) => {
    if( worker_pid.includes( _Worker.process.pid ) ){
      process.stdout.write( ` ${'|'.red()}${'   soc'.red().underline()}(${ _Worker.id }) ${_Worker.process.pid} ${'forked'.green()}\n` );
    }
  } );
  cluster.on( 'online', ( _Worker ) => {} );
  cluster.on( 'disconnect', ( _Worker ) => {} );
  cluster.on( 'message', ( _Worker, _message, _Handle ) => {} );

}
