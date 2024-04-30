#!/usr/bin/env -S node

import cluster from 'node:cluster';

import { SocketConfig } from '../socket.js';

process.title = `ivy-socket-${ cluster.worker.id }`;
// splice the first two elements from the process.argv array
process.argv.splice( 0, 2 );

if( process.argv.length > 1 ){
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

const socketConfig: SocketConfig = config.default;
if( socketConfig.type === 'tls' ){

  const createServer = await import( 'node:tls' ).then( module => module.createServer );
  const socket = createServer( {
    keepAlive: true,
    ...socketConfig.socketOptions || {}
  }, socketConfig.listener );

  socket.listen( socketConfig.port, socketConfig.hostname, () => {
    console.log( `Socket server listening ${socketConfig.hostname}:${socketConfig.port.toString()}` );
  } );

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

  socket.listen( socketConfig.socketPath || `${process.cwd()}/ivy.sock`, () => {
    console.log( `Socket server listening ${socketConfig.socketPath}` );
  } );

  socket.on( 'error', ( error ) => {
    process.stderr.write( error.message );
    process.exit( 1 );
  } );
}
