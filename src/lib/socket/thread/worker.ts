#!/usr/bin/env -S node
import { extends_proto } from '@nutsloop/ivy-ansi';
import cluster from 'node:cluster';
import { createServer as createServerSock, type Socket } from 'node:net';
import { createServer as createServerTLS, type TLSSocket } from 'node:tls';

import { SocketConfig } from '../socket.js';

extends_proto();

// Ensure we're in a worker context
if ( ! cluster.worker ) {
  console.error( 'This script must be run as a worker process' );
  process.exit( 1 );
}

// Type assertion to tell TypeScript that cluster.worker is defined
const worker = cluster.worker;

process.title = `ivy-socket(${ worker.id })`;
// splice the first two elements from the process.argv array
process.argv.splice( 0, 2 );

if( process.argv.length > 2 ){
  process.stderr.write( 'Too many arguments.\n' );
  process.exit( 1 );
}

const socketConfigFile = process.argv[ 0 ];

const config = await import( socketConfigFile ).then( module => module );
const exportedModule = Object.keys( config );
if( exportedModule.length === 0 ){

  console.log( 'socketConfig.js doesn\'t have the "default" export.' );
  process.exit( 1 );
}
else if( exportedModule.length > 1 ){

  console.log( 'socketConfig.js must have only the "default" export.' );
  process.exit( 1 );
}
else if( ! exportedModule.includes( 'default' ) ){

  console.log( 'socketConfig.js doesn\'t have the "default" export' );
  process.exit( 1 );
}

const control_room = process.argv[ 1 ] === 'true';

// if control room is enabled
// HINT: the control room is not implemented as is supposed to be.
//       it is just a proof of concept.
if( control_room ){

  // ping control room socket every second
  // the control room will the send to the socket client memory usage.
  setInterval( () => {
    if ( process.send ) {
      process.send( {
        'control-room': {
          heap_usage: {
            heap: {
              id: worker.id,
              pid: process.pid,
              usage: Number( ( process.memoryUsage().rss / ( 1024 * 1024 ) ).toFixed( 2 ) ),
              wrk: 'socket'
            }
          }
        }
      } );
    }
  }, 500 );
}

const socketConfig: SocketConfig = config.default;
if( socketConfig.type === 'tls' ){

  const clients: TLSSocket[] = [];
  const server = createServerTLS( {
    keepAlive: true,
    ...socketConfig.socketOptions || {}
  }, socketConfig.listener );

  server.listen( socketConfig.port, socketConfig.hostname, listening_on );

  server.on( 'connection', ( socket: TLSSocket ) => {
    clients.push( socket );
    socket.on( 'close', () => {
      const index = clients.indexOf( socket );
      if ( index !== - 1 ) {
        clients.splice( index, 1 );
      }
    } );
  } );

  server.on( 'error', ( error ) => {
    process.stderr.write( error.message );
    process.exit( 1 );
  } );
}
else if( socketConfig.type === 'sock' ){

  const clients: Socket[] = [];
  const server = createServerSock( {
    keepAlive: true,
    ...socketConfig.socketOptions || {}
  }, socketConfig.listener as ( socket: Socket ) => void );

  server.listen( socketConfig.socketPath || `${process.cwd()}/ivy.sock`, listening_on );

  server.on( 'connection', ( socket: Socket ) => {
    clients.push( socket );
    socket.on( 'close', () => {
      const index = clients.indexOf( socket );
      if ( index !== - 1 ) {
        clients.splice( index, 1 );
      }
    } );
  } );

  server.on( 'error', ( error ) => {
    process.stderr.write( error.message );
    process.exit( 1 );
  } );
}

function listening_on(){

  const pid = worker.process.pid;
  const id = worker.id;
  let address = '';
  let port = '';

  if( socketConfig.type === 'tls' ){
    address = socketConfig.hostname.magenta();
    port = `:${socketConfig.port.toString().yellow()}`;
  }
  else if( socketConfig.type === 'sock' ){
    if( socketConfig.socketPath ) {
      address = socketConfig.socketPath.magenta();
      port = '';
    }
  }

  process.stdout.write( ` ${'|'.red()}${'   soc'.red().underline()}(${ id }) ${pid} listening on ${ address }${ port }\n` );
}
