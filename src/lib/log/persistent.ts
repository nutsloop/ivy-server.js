import { Path } from '@ivy-industries/cross-path';
import cluster from 'node:cluster';

const path = new Path();

export interface LogConfig{
  callback: ( ...rest: unknown[] ) => Promise<void> | void;
  init?: () => Promise<void>;
}

const worker_pid = [];

export async function log_persistent( log_config_path: string, threads?: number ): Promise<void> {

  const ivy_log_worker = [
    path.dirname( new URL( import.meta.url ).pathname ),
    'thread',
    'worker.js'
  ];

  cluster.setupPrimary( {
    args: [ log_config_path ],
    exec: path.resolve( ...ivy_log_worker )
  } );

  for ( let i = 0; i < threads; i ++ ) {
    worker_pid.push( cluster.fork().process.pid );
  }

  cluster.on( 'exit', ( _Worker, _code, _signal ) => {} );

  cluster.on( 'listening', ( _Worker ) => {} );
  cluster.on( 'fork', ( _Worker ) => {
    if( worker_pid.includes( _Worker.process.pid ) ){
      process.stdout.write( ` ${'|'.red()}${'   log'.red().underline()}(${ _Worker.id }) ${_Worker.process.pid}\n` );
    }
  } );
  cluster.on( 'online', ( _Worker ) => {} );
  cluster.on( 'disconnect', ( _Worker ) => {} );
  cluster.on( 'message', async ( _Worker, message, _Handle ) => {

    if( message?.log ){
      const log_workers = [];
      for( const worker of Object.values( cluster.workers ) ){
        if( worker_pid.includes( worker.process.pid ) ){
          log_workers.push( worker );
        }
      }
      log_workers[ get_random_worker( log_workers.length ) ].send( message.log );
    }
  } );
}

function get_random_worker( workers_length: number ): number {

  if ( workers_length === 1 ){
    return 0;
  }

  const minCeiled = Math.ceil( 0 );
  const maxFloored = Math.floor( workers_length - 1 );

  return Math.floor( Math.random() * ( maxFloored - minCeiled + 1 ) + minCeiled );

}
