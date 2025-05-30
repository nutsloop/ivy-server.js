import type { Path } from '@nutsloop/ivy-cross-path';

import cluster from 'node:cluster';


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

const worker_pid: ( number | undefined )[] = [];

export async function main( log_config_path: string, control_room_is_active: boolean, path: Path ): Promise<void> {

  const ivy_log_worker = [
    path.dirname( new URL( import.meta.url ).pathname ),
    'thread',
    'worker.js',
  ];

  const control_room = control_room_is_active;
  cluster.setupPrimary( {
    args: [ log_config_path, control_room.toString() ],
    exec: path.resolve( ...ivy_log_worker ),
  } );

  worker_pid.push( cluster.fork().process.pid );

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

  cluster.on( 'message', async ( Worker, message, _Handle ) => {
    if ( message?.log ) {
      if ( worker_pid.includes( Worker.process.pid ) ) {
        Worker.send( message.log );
      }
    }
  } );
}
