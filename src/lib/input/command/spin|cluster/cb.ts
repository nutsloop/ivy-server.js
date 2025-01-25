import { Path } from '@ivy-industries/cross-path';
import { CallBackArgvData, CallBackAsync } from '@nutsloop/ivy-input';
import cluster from 'node:cluster';
import { cpus } from 'node:os';

import { control_room } from '../../../control/room.js';
import { log_persistent } from '../../../log/persistent.js';
import { routing } from '../../../server/routing.js';
import { socket } from '../../../socket/socket.js';

const path = new Path();

type SpinClusterData =
  CallBackArgvData<'address' | 'exec', string > &
  CallBackArgvData<'control-room', boolean > &
  CallBackArgvData<'cpus' |
    'log-persistent' |
    'port' |
    'socket', number > &
  CallBackArgvData<'http2' | 'https',
    Map<'cert' | 'dhparam' | 'key', string> | null >;

const server_pid = [];

export const spin_cluster_cb: CallBackAsync = async ( data: SpinClusterData, spin: boolean ): Promise<void> => {

  if( cluster.isPrimary ){
    process.stdout.write( ` ${'|'.red()}${'ivy'.red().underline()}(0) ${process.pid}\n` );
  }

  await spawn_control_room( data.has( 'control-room' ) );
  await spawn_log_persistent( data.has( 'log-persistent' ), data.get( 'log-persistent' ) );
  await spawn_socket( data.has( 'socket' ), data.get( 'socket' ) );
  if( spin ){

    await server( data );
  }
  else {

    const path = new Path();
    routing.set( 'cluster', true );

    if ( cluster.isPrimary ) {

      const path_to_ivy_server_exec = [
        path.dirname( new URL( import.meta.url ).pathname ),
        '..',
        '..',
        '..',
        '..',
        'bin',
        'server.js'
      ];

      const clusterSetup = new Map();
      clusterSetup.set( 'nCPUS', data.get( 'cpus' ) || cpus().length / 2 );
      clusterSetup.set( 'exec', data.get( 'exec' ) || path.resolve( ...path_to_ivy_server_exec ) );

      cluster.setupPrimary( {
        args: process.argv,
        exec: clusterSetup.get( 'exec' ),
      } );
      for ( let i = 0; i < clusterSetup.get( 'nCPUS' ); i ++ ) {
        server_pid.push( cluster.fork().process.pid );
      }

      cluster.on( 'exit', ( _Worker, code, signal ) => {

        if( server_pid.includes( _Worker.process.pid ) ){

          server_pid.splice( server_pid.indexOf( _Worker.process.pid ), 1 );
          process.stdout.write( `worker -> ${ _Worker.id } died with code [${code}] & signal[${ signal }]\n` );
          cluster.fork();
        }
      } );

      cluster.on( 'listening', ( _Worker, _address ) => {} );

      cluster.on( 'online', ( _Worker ) => {} );
      cluster.on( 'fork', ( _Worker ) => {
        if( server_pid.includes( _Worker.process.pid ) ){
          process.stdout.write( ` ${'|'.red()}${'   wrk'.red().underline()}(${ _Worker.id }) ${_Worker.process.pid}` );
          process.stdout.write( ` listening on ${ routing.get( 'address' ).magenta() }:` );
          process.stdout.write( `${ routing.get( 'port' ).toFixed().yellow() }\n` );
        }
      } );

      cluster.on( 'message', ( _worker, _message ) => {} );
    }
    else if( cluster.isWorker ){

      // if control room is enabled
      if( routing.get( 'control-room' ) ){
        // ping control room socket every second
        // the control room will the send to the socket client memory usage.
        setInterval( () => {
          process.send( { 'control-room':{
            heap_usage: {
              heap: {
                id: cluster.worker.id,
                pid: process.pid,
                usage: Number( ( process.memoryUsage().rss / ( 1024 * 1024 ) ).toFixed( 2 ) ),
                wrk: `worker-server-${ cluster.worker.id }`
              }
            }
          } } );
        }, 500 );
      }

      process.title = `ivy-server(${ cluster.worker.id })`;
      await server( data );
    }
  }
};

async function server( data: SpinClusterData ): Promise<void> {

  const address: string = data.get( 'address' ) || '0.0.0.0';
  const port: number = data.get( 'port' ) || 3001;

  if( data.get( 'https' ) === null || data.get( 'https' ) ){

    await ( await import( '../../../server/type/https.js' ) )
      .https( port, address, data.get( 'https' ) );

  }
  /*else if( data.get( 'http2' ) === null || data.get( 'http2' ) ){

    await ( await import( '../../../server/type/http2.js' ) )
      .http2( port, address, data.get( 'http2' ) );

  }*/
  else{

    await ( await import( '../../../server/type/http.js' ) )
      .http( port, address );
  }
}

async function spawn_control_room( invoked_flag: boolean ): Promise<void> {

  if( invoked_flag ){
    if( cluster.isPrimary ) {

      const controlRoomConfig = await path.isFile( path.resolve( ...[ process.cwd(), 'controlRoomConfig.js' ] ) ).catch( () => false );
      if( typeof controlRoomConfig === 'string' ){

        await control_room( controlRoomConfig );
      }
      else{
        process.stderr.write( 'No controlRoom.js file found.' );
        process.exit( 1 );
      }
    }
  }
}

async function spawn_log_persistent( invoked_flag: boolean, threads: number ): Promise<void> {


  if( invoked_flag ){
    if( cluster.isPrimary ) {

      const logConfigFile = await path.isFile( path.resolve( ...[ process.cwd(), 'logConfig.js' ] ) ).catch( () => false );
      if( typeof logConfigFile === 'string' ){

        await log_persistent( logConfigFile, threads );
      }
      else{
        process.stderr.write( 'No logConfig.js file found.' );
        process.exit( 1 );
      }
    }
  }
}

async function spawn_socket( invoked_flag: boolean, threads: number ): Promise<void> {

  if( invoked_flag ){
    if( cluster.isPrimary ) {

      const socketConfigFile = await path.isFile( path.resolve( ...[ process.cwd(), 'socketConfig.js' ] ) ).catch( () => false );
      if( typeof socketConfigFile === 'string' ){

        await socket( socketConfigFile, threads );
      }
      else{
        process.stderr.write( 'No socketConfig.js file found.' );
        process.exit( 1 );
      }
    }
  }
}
