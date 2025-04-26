import type { CallBackArgvData } from '@nutsloop/ivy-input';

import { Path } from '@nutsloop/ivy-cross-path';
import cluster from 'node:cluster';
import { cpus } from 'node:os';

import { LiveReloadConf, routing } from '../server/routing.js';
import { on_message_listener } from './on-message-listener.js';
import { server_instance } from './server-instance.js';
import { control_room } from './spawn/control-room.js';
import { live_reload } from './spawn/live-reload.js';
import { log } from './spawn/log.js';
import { logger } from './spawn/logger.js';
import { socket } from './spawn/socket.js';

export type SpinClusterData =
  CallBackArgvData<'address' | 'exec', string > &
  CallBackArgvData<'control-room' | 'log', boolean > &
  CallBackArgvData<'cpus' |
    'log-persistent' |
    'port' |
    'socket', number > &
  CallBackArgvData<'http2' | 'https',
    Map<'cert' | 'dhparam' | 'key', string> | null > &
  CallBackArgvData<'live-reload', LiveReloadConf >;

const path = new Path();
const killed_by_us = new Set<number>();
const server_pid: ( number | undefined )[] = [];

export async function main( command: 'spin' | 'cluster', data: SpinClusterData ) : Promise<void> {

  if( cluster.isPrimary ){
    process.stdout.write( ` ${'|'.red()}${'ivy'.red().underline()}(0) ${process.pid}\n` );
  }

  live_reload( data.has( 'live-reload' ), data.get( 'live-reload' ), path );
  log( data.has( 'log' ), path );
  control_room( data.has( 'control-room' ), path );
  logger( data.has( 'log-persistent' ), data.has( 'control-room' ), path );
  socket( data.has( 'socket' ), path );

  // MARK: spawn a single instance of the server.
  if( command === 'spin' ) {

    await server_instance( data ).catch( console.error );

  }
  // MARK: spawn multiple instances of the server.
  else if( command === 'cluster' ) {

    routing.set( 'cluster', true );

    if ( cluster.isPrimary ) {

      const server_workers = routing.set( 'server-workers', new Map() ).get( 'server-workers' );
      const path_to_ivy_server_exec = [
        path.dirname( new URL( import.meta.url ).pathname ),
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

      cluster.on( 'message', on_message_listener );
    }
    else if( cluster.isWorker ){

      // HINT: plugin a complex module to handle this.
      process.on( 'message', ( message ) => {
        console.log( message );
      } );

      // if control room is enabled
      if( data.has( 'control-room' ) ){
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
      await server_instance( data ).catch( console.error );
    }
  }
  // MARK: edge cases.
  else {
    throw new Error( `invalid command: ${ command } passed to ivy-server.`.red().underline().strong() );
  }
}
