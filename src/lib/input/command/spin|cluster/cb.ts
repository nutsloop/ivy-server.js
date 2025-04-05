import { Path } from '@nutsloop/ivy-cross-path';
import { CallBackArgvData, CallBackAsync } from '@nutsloop/ivy-input';
import cluster from 'node:cluster';
import { cpus } from 'node:os';

import { control_room } from '../../../control/room.js';
import { log_persistent } from '../../../log/persistent.js';
import { process_listener } from '../../../server/process.js';
import { routing } from '../../../server/routing.js';
import { socket } from '../../../socket/socket.js';

const path = new Path();
const killed_by_us = new Set<number>();

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
const log_pid = [];

export const spin_cluster_cb: CallBackAsync = async ( data: SpinClusterData, spin: boolean ): Promise<void> => {

  if( cluster.isPrimary ){
    process.stdout.write( ` ${'|'.red()}${'ivy'.red().underline()}(0) ${process.pid}\n` );
  }

  await spawn_log_wrk( routing.get( 'log' ) );
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

      cluster.on( 'exit', ( Worker, code, signal ) => {

        if( server_pid.includes( Worker.process.pid ) ){
          if( ! killed_by_us.has( Worker.process.pid ) ) {
            server_pid.splice( server_pid.indexOf( Worker.process.pid ), 1 );
            process.stdout.write( `worker -> ${ Worker.id } died with code [${ code }] & signal[${ signal }]. forking a new worker...\n`.yellow().underline().strong() );
            server_pid.push( cluster.fork().process.pid );
          }
        }
      } );

      cluster.on( 'disconnect', ( Worker ) => {
        if( server_pid.includes( Worker.process.pid ) ){
          process.stdout.write( `worker -> ${ Worker.id } disconnected. killing and forking replacement...\n`.cyan().underline().strong() );
          killed_by_us.add( Worker.process.pid );
          Worker.process.kill();
          server_pid.splice( server_pid.indexOf( Worker.process.pid ), 1 );
          server_pid.push( cluster.fork().process.pid );
        }
      } );

      cluster.on( 'listening', ( _Worker, _address ) => {} );

      cluster.on( 'online', ( _Worker ) => {} );
      cluster.on( 'fork', ( Worker ) => {
        if( server_pid.includes( Worker.process.pid ) ){
          process.stdout.write( ` ${'|'.red()}${'   wrk'.red().underline()}(${ Worker.id }) ${Worker.process.pid}` );
          process.stdout.write( ` listening on ${ routing.get( 'address' ).magenta() }:` );
          process.stdout.write( `${ routing.get( 'port' ).toFixed().yellow() }\n` );
        }
      } );

      cluster.on( 'message', process_listener );
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

// TODO: server call
async function server( data: SpinClusterData ): Promise<void> {

  const address: string = data.get( 'address' ) || '0.0.0.0';
  const port: number = data.get( 'port' ) || 3001;

  if( data.get( 'https' ) === null || data.get( 'https' ) ){

    await ( await import( '../../../server/type/https.js' ) )
      .https( port, address, data.get( 'https' ) );

  }
  else{

    await ( await import( '../../../server/type/http.js' ) )
      .http( port, address );
  }
}

async function spawn_log_wrk( invoked_flag: boolean ): Promise<void> {

  if ( invoked_flag && cluster.isPrimary ){
    const log_wrk = [
      path.dirname( new URL( import.meta.url ).pathname ),
      '..',
      '..',
      '..',
      'log',
      'wrk.js'
    ];

    cluster.setupPrimary( {
      exec: path.resolve( ...log_wrk ),
    } );

    log_pid.push( cluster.fork().process.pid );

    cluster.on( 'fork', ( Worker ) => {

      if( log_pid.includes( Worker.process.pid ) ){
        routing.set( 'log_worker', Worker );
        process.stdout.write( ` ${'|'.red()}${'   log'.red().underline()}(${ Worker.id }) ${Worker.process.pid}\n` );
      }
    } );
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
