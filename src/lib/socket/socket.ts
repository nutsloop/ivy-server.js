import type { Path } from '@nutsloop/ivy-cross-path';
import type { ServerOpts, Socket } from 'node:net';
import type { TLSSocket, TlsOptions } from 'node:tls';

import cluster from 'node:cluster';

import { routing } from '../server/routing.js';


export interface SocketConfig{
  hostname: string;
  listener: ( socket: Socket & TLSSocket ) => Promise<void> | void;
  port: number;
  socketOptions?: ServerOpts | TlsOptions;
  socketPath?: string;
  type: 'sock' | 'tls';
}

let worker_pid = 0;

export async function main( socket_config_path: string, path: Path ): Promise<void> {

  const ivy_socket_worker = [
    path.dirname( new URL( import.meta.url ).pathname ),
    'thread',
    'worker.js'
  ];

  cluster.setupPrimary( {
    args: [ socket_config_path, routing.get( 'control-room' ).toString() ],
    exec: path.resolve( ...ivy_socket_worker )
  } );

  worker_pid = cluster.fork().process.pid || 0;

  cluster.on( 'exit', ( Worker, _code, _signal ) => {

    if( worker_pid === Worker.process.pid ){

      worker_pid = 0;
      process.stdout.write( ` ${'|'.red()}${'   soc'.red().underline()}(${ Worker.id }) ${Worker.process.pid} ${'exited'.red()}\n` );
      cluster.setupPrimary( {
        args: [ socket_config_path, routing.get( 'control-room' ).toString() ],
        exec: path.resolve( ...ivy_socket_worker )
      } );

      worker_pid = cluster.fork().process.pid || 0;
    }
  } );

  cluster.on( 'fork', ( Worker ) => {

    if( worker_pid === Worker.process.pid ){

      routing.set( 'socket-worker', Worker );
      process.stdout.write( ` ${'|'.red()}${'   soc'.red().underline()}(${ Worker.id }) ${Worker.process.pid} ${'forked'.green()}\n` );
    }
  } );

  cluster.on( 'message', ( _Worker, message, _Handle ) => {

    if( message?.socket_log ){

      if( message.worker_id ){
        const server_worker_id = message.worker_id;
        const server_worker = routing.get( 'server-workers' )?.get( server_worker_id );
        if( server_worker ){
          server_worker.send( message.socket_log );
        }
      }

      const socket_worker = routing.get( 'socket-worker' );
      if( socket_worker && worker_pid === socket_worker.process.pid ){
        socket_worker.send( message.socket_log );
      }

    }
  } );

  // HINT: to de implemented?????
  //cluster.on( 'online', ( _Worker ) => {} );
  //cluster.on( 'disconnect', ( _Worker ) => {} );
  //cluster.on( 'listening', ( _Worker, _address ) => {} );

}
