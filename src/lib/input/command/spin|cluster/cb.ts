import { Path } from '@nutsloop/ivy-cross-path';
import { CallBackArgvData, CallBackAsync } from '@nutsloop/ivy-input';
import cluster from 'node:cluster';
import { cpus } from 'node:os';

import { control_room } from '../../../control/room.js';
import { log_persistent } from '../../../log/persistent.js';
import { process_listener } from '../../../server/process.js';
import { type LiveReloadConf, routing, type RoutingValue } from '../../../server/routing.js';
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
    Map<'cert' | 'dhparam' | 'key', string> | null > &
  CallBackArgvData<'live-reload', LiveReloadConf >;

const server_pid: ( number | undefined )[] = [];
const log_pid: ( number | undefined )[] = [];
const sse_pid: ( number | undefined )[] = [];

export const spin_cluster_cb: CallBackAsync<SpinClusterData, [spin:boolean]> = async ( data: SpinClusterData, spin: boolean ): Promise<void> => {

  if( cluster.isPrimary ){
    process.stdout.write( ` ${'|'.red()}${'ivy'.red().underline()}(0) ${process.pid}\n` );
  }

  await spawn_log_wrk( routing.get( 'log' ) );
  await spawn_live_reload_wrk( routing.get( 'live-reload' ), data.get( 'live-reload' ) );
  await spawn_control_room( data.has( 'control-room' ) );
  await spawn_log_persistent( data.has( 'log-persistent' ), data.get( 'log-persistent' ) );
  await spawn_socket( data.has( 'socket' ) );

  if( spin ){

    await server( data );
  }
  else {

    const path = new Path();
    routing.set( 'cluster', true );

    if ( cluster.isPrimary ) {

      const server_workers = routing.set( 'server-workers', new Map() ).get( 'server-workers' );
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

        if( Worker.process.pid ){
          if ( server_pid.includes( Worker.process.pid ) ) {
            if ( ! killed_by_us.has( Worker.process.pid ) ) {
              server_pid.splice( server_pid.indexOf( Worker.process.pid ), 1 );
              process.stdout.write( `worker -> ${ Worker.id } died with code [${ code }] & signal[${ signal }]. forking a new worker...\n`.yellow().underline().strong() );
              server_pid.push( cluster.fork().process.pid );
            }
          }
        }
      } );

      cluster.on( 'disconnect', ( Worker ) => {

        if( Worker.process.pid ){
          if ( server_pid.includes( Worker.process.pid ) ) {
            process.stdout.write( `worker -> ${ Worker.id } disconnected. killing and forking replacement...\n`.cyan().underline().strong() );
            killed_by_us.add( Worker.process.pid );
            Worker.process.kill();
            server_pid.splice( server_pid.indexOf( Worker.process.pid ), 1 );
            server_pid.push( cluster.fork().process.pid );
          }
        }
      } );

      cluster.on( 'listening', ( _Worker, _address ) => {} );

      cluster.on( 'online', ( _Worker ) => {} );
      cluster.on( 'fork', ( Worker ) => {
        if ( server_pid.includes( Worker.process.pid ) ) {
          process.stdout.write( ` ${ '|'.red() }${ '   wrk'.red().underline() }(${ Worker.id }) ${ Worker.process.pid }` );
          if( server_workers ){
            server_workers.set( Worker.id, Worker );
          }
          const address = routing.get( 'address' );
          const port = routing.get( 'port' );
          if ( address && port ) {
            process.stdout.write( ` listening on ${ address.magenta() }:` );
            process.stdout.write( `${ port.toFixed().yellow() }\n` );
          }
        }
      } );

      cluster.on( 'message', process_listener );
    }
    else if( cluster.isWorker ){

      // HINT: plugin a complex module to handle this.
      process.on( 'message', ( message ) => {
        console.log( message );
      } );

      // if control room is enabled
      if( routing.get( 'control-room' ) ){
        // ping control room socket every second
        // the control room will the send to the socket client memory usage.
        setInterval( () => {
          if ( cluster.worker && process.send ) {
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
          }
        }, 500 );
      }

      if ( cluster.worker ) {
        process.title = `ivy-server(${ cluster.worker.id })`;
      }
      await server( data );
    }
  }
};

// TODO: server call
async function server( data: SpinClusterData ): Promise<void> {

  const address: string = data.get( 'address' ) || '0.0.0.0';
  const port: number = data.get( 'port' ) || 3001;

  if( data.get( 'https' ) === null || data.get( 'https' ) ){
    const httpsConfig = data.get( 'https' );
    // Convert null to undefined to match the expected type
    const config = httpsConfig === null ? undefined : httpsConfig;

    await ( await import( '../../../server/type/https.js' ) )
      .https( port, address, config );

  }
  else{

    await ( await import( '../../../server/type/http.js' ) )
      .http( port, address );
  }
}

async function spawn_live_reload_wrk( invoked_flag: RoutingValue, sse_config_data: LiveReloadConf | undefined ): Promise<void> {

  if( invoked_flag && cluster.isPrimary ){

    const sse_config = new Map();
    sse_config.set( 'cors_port', routing.get( 'port' ) );

    if( sse_config_data === null ){
      sse_config.set( 'host', routing.get( 'address' ) );
      sse_config.set( 'port', 6553 );
    }

    if( sse_config_data !== null && sse_config_data ){

      if( sse_config_data.has( 'host' ) ){
        sse_config.set( 'host', sse_config_data.get( 'host' ) );
      }
      else{
        sse_config.set( 'host', routing.get( 'address' ) );
      }
      if( sse_config_data.has( 'port' ) ){
        sse_config.set( 'port', sse_config_data.get( 'port' ) );
      }
      else{
        sse_config.set( 'port', 6553 );
      }
    }

    routing.set( 'live-reload-conf', sse_config );

    const sse_wrk = [
      path.dirname( new URL( import.meta.url ).pathname ),
      '..',
      '..',
      '..',
      'live-reload',
      'wrk.js'
    ];

    cluster.setupPrimary( {
      exec: path.resolve( ...sse_wrk ),
      args: [ ... sse_config ].flat()
    } );

    sse_pid.push( cluster.fork().process.pid );

    cluster.on( 'fork', ( Worker ) => {

      if( sse_pid.includes( Worker.process.pid ) ){
        process.stdout.write( ` ${'|'.red()}${'   sse'.red().underline()}(${ Worker.id }) ${Worker.process.pid}` );
        process.stdout.write( ` listening on ${ sse_config.get( 'host' ).magenta() }:` );
        process.stdout.write( `${ sse_config.get( 'port' ).toFixed().yellow() }\n` );
      }
    } );

  }
}

async function spawn_log_wrk( invoked_flag: RoutingValue ): Promise<void> {

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

async function spawn_control_room( invoked_flag: boolean | undefined ): Promise<void> {

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

async function spawn_log_persistent( invoked_flag: boolean | undefined, threads: number | undefined ): Promise<void> {


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

async function spawn_socket( invoked_flag: boolean | undefined ): Promise<void> {

  if( invoked_flag ){
    if( cluster.isPrimary ) {

      const socketConfigFile = await path.isFile( path.resolve( ...[ process.cwd(), 'socketConfig.js' ] ) ).catch( () => false );
      if( typeof socketConfigFile === 'string' ){

        await socket( socketConfigFile );
      }
      else{
        process.stderr.write( 'No socketConfig.js file found.' );
        process.exit( 1 );
      }
    }
  }
}
