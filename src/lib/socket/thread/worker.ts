#!/usr/bin/env -S node

import { extends_proto } from '@ivy-industries/ansi';
import cluster from 'node:cluster';

import { SocketConfig } from '../socket.js';

extends_proto();

process.title = `ivy-socket(${ cluster.worker.id })`;
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
if( control_room ){

  // ping control room socket every second
  // the control room will the send to the socket client memory usage.
  setInterval( () => {
    process.send( { 'control-room':{
      heap_usage: {
        heap: {
          id: cluster.worker.id,
          pid: process.pid,
          usage: Number( ( process.memoryUsage().rss / ( 1024 * 1024 ) ).toFixed( 2 ) ),
          wrk: 'socket'
        }
      }
    } } );
  }, 500 );
}

const socketConfig: SocketConfig = config.default;

if( socketConfig.type === 'tls' ){

  const createServer = await import( 'node:tls' ).then( module => module.createServer );
  const socket = createServer( {
    keepAlive: true,
    ...socketConfig.socketOptions || {}
  }, socketConfig.listener );

  socket.listen( socketConfig.port, socketConfig.hostname, listeningListener );

  socket.on( 'error', ( error ) => {
    process.stderr.write( error.message );
    process.exit( 1 );
  } );
}
else if( socketConfig.type === 'sock' ){

  const createServer = await import( 'node:net' ).then( module => module.createServer );
  const socket = createServer( {
    keepAlive: true,
    ...socketConfig.socketOptions || {}
  }, socketConfig.listener );

  socket.listen( socketConfig.socketPath || `${process.cwd()}/ivy.sock`, listeningListener );

  socket.on( 'error', ( error ) => {
    process.stderr.write( error.message );
    process.exit( 1 );
  } );
}

function listeningListener(){

  const pid = cluster.worker.process.pid;
  const id = cluster.worker.id;
  let address: string;
  let port: string;

  if( socketConfig.type === 'tls' ){
    address = socketConfig.hostname.magenta();
    port = `:${socketConfig.port.toString().yellow()}`;
  }
  else if( socketConfig.type === 'sock' ){
    address = socketConfig.socketPath.magenta();
    port = '';
  }

  process.stdout.write( ` ${'|'.red()}${'   soc'.red().underline()}(${ id }) ${pid} listening on ${ address }${ port }\n` );
}
