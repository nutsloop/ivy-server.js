import type { ServerOpts, Socket } from 'node:net';
import type { TLSSocket, TlsOptions } from 'node:tls';

import { Path } from '@ivy-industries/cross-path';
import cluster from 'node:cluster';

const path = new Path();

export interface SocketConfig{
  hostname: string;
  listener: ( socket: Socket & TLSSocket ) => Promise<void> | void;
  port: number;
  socketOptions?: ServerOpts | TlsOptions;
  socketPath?: string;
  type: 'sock' | 'tls';
}

export async function socket( socket_config_path: string, threads?: number ): Promise<void> {

  const ivy_socket_worker = [
    path.dirname( new URL( import.meta.url ).pathname ),
    'thread',
    'worker.js'
  ];

  cluster.setupPrimary( {
    args: [ socket_config_path ],
    exec: path.resolve( ...ivy_socket_worker )
  } );

  for ( let i = 0; i < threads; i ++ ) {
    cluster.fork();
  }

  cluster.on( 'exit', ( Worker, code, signal ) => {
    process.stdout.write( `worker -> ${ Worker.id } died with code [${code}] & signal[${ signal }]\n` );
    cluster.fork();
  } );

  cluster.on( 'listening', ( Worker, address ) => {
    process.stdout.write( ` ${'|'.red()}${'   wrk'.red().underline()}(${ Worker.id }) ${Worker.process.pid} listening on ${ address.address.magenta() }:${ address.port.toString().yellow() }\n` );
  } );

  cluster.on( 'fork', ( _Worker ) => {} );
  cluster.on( 'online', ( _Worker ) => {} );
  cluster.on( 'disconnect', ( _Worker ) => {} );
  cluster.on( 'message', ( _Worker, _message, _Handle ) => {} );

}
