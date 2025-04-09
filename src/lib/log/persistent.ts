import { Path } from '@nutsloop/ivy-cross-path';
import cluster from 'node:cluster';

import { routing } from '../server/routing.js';

const path = new Path();

/**
 * This interface defines the configuration for a persistent log.
 */
export interface LogConfig {
  /**
   * the actual callback function that will be called when the log is ready to be written.
   * it may be a writeFile call, insert into a database and|or whatever you want.
   */
  callback: ( log_data: string[] ) => Promise<void> | void;
  /**
   * the init function is called before the callback function is called.
   * it may be used to create a directory or a file or a database connection or whatever you want.
   */
  init?: ( ...init_args: unknown[] ) => Promise<void> | void;
  /**
   * arguments for the init function.
   */
  init_args?: unknown[];
}

const worker_pid = [];

export async function log_persistent( log_config_path: string, threads?: number, ): Promise<void> {

  const ivy_log_worker = [
    path.dirname( new URL( import.meta.url ).pathname ),
    'thread',
    'worker.js',
  ];

  cluster.setupPrimary( {
    args: [ log_config_path, routing.get( 'control-room' ).toString() ],
    exec: path.resolve( ...ivy_log_worker ),
  } );

  for ( let i = 0; i < threads; i ++ ) {
    worker_pid.push( cluster.fork().process.pid );
  }

  cluster.on( 'exit', ( _Worker, _code, _signal ) => {
    if ( worker_pid.includes( _Worker.process.pid ) ) {
      process.stdout.write(
        ` ${'|'.red()}${'   log'.red().underline()}(${_Worker.id}) ${_Worker.process.pid} ${'exited'.red()}\n`,
      );
      worker_pid.splice( worker_pid.indexOf( _Worker.process.pid ), 1 );
      worker_pid.push( cluster.fork().process.pid );
    }
  } );

  cluster.on( 'listening', ( _Worker ) => {} );
  cluster.on( 'fork', ( _Worker ) => {
    if ( worker_pid.includes( _Worker.process.pid ) ) {
      process.stdout.write(
        ` ${'|'.red()}${'   log'.red().underline()}(${_Worker.id}) ${_Worker.process.pid}\n`,
      );
    }
  } );
  cluster.on( 'online', ( _Worker ) => {} );
  cluster.on( 'disconnect', ( _Worker ) => {} );
  cluster.on( 'message', async ( _Worker, message, _Handle ) => {
    if ( message?.log ) {
      const log_workers = [];
      for ( const worker of Object.values( cluster.workers ) ) {
        if ( worker_pid.includes( worker.process.pid ) ) {
          log_workers.push( worker );
        }
      }
      log_workers[ get_random_worker( log_workers.length ) ].send( message.log );
    }
  } );
}

function get_random_worker( workers_length: number ): number {
  if ( workers_length === 1 ) {
    return 0;
  }

  const min_ceiled = Math.ceil( 0 );
  const max_floored = Math.floor( workers_length - 1 );

  return Math.floor( Math.random() * ( max_floored - min_ceiled + 1 ) + min_ceiled );
}
