#!/usr/bin/env -S node
import { extends_proto } from '@nutsloop/ivy-ansi';
import cluster from 'node:cluster';
import { Socket, createServer } from 'node:net';

import type { ControlRoomConfig } from '../room.js';

export type OfMessage = {
  heap_usage: {
    heap: {
      id: number;
      pid: number;
      usage: number;
      wrk: string;
    }
}} | string;

extends_proto();

process.title = `ivy-socket-control-room(${ cluster.worker.id })`;
// splice the first two elements from the process.argv array
process.argv.splice( 0, 2 );

if( process.argv.length > 1 ){
  process.stderr.write( 'Too many arguments.\n' );
  process.exit( 1 );
}

const controlRoomConfigFile = process.argv[ 0 ];
const streaming = [];

const config = await import( controlRoomConfigFile ).then( module => module );
const exportedModule = Object.keys( config );
if( exportedModule.length === 0 ){

  console.log( 'controlRoomConfig.js doesn\'t have the "default" export.' );
  process.exit( 1 );
}
else if( exportedModule.length > 1 ){

  console.log( 'controlRoomConfig.js must have only the "default" export.' );
  process.exit( 1 );
}
else if( ! exportedModule.includes( 'default' ) ){

  console.log( 'controlRoomConfig.js doesn\'t have the "default" export' );
  process.exit( 1 );
}

const controlRoomConfig: ControlRoomConfig = config.default;

const socket = createServer( {
  keepAlive: true
}, listener );

socket.listen( controlRoomConfig.port, controlRoomConfig.hostname, listeningListener );

socket.on( 'error', ( error ) => {
  process.stderr.write( error.message );
  process.exit( 1 );
} );

process.on( 'message', ( message: {'control-room': OfMessage } ) => {

  //todo add a function to handle the message from the master process related to the control room
  if( message?.[ 'control-room' ] ){

    // message_to_client is the message that will be sent to the client based on the message from the master process
    let message_to_client:string;

    // get the memory statistics of the worker itself
    // it will send to the socket client the data.
    if ( message[ 'control-room' ] === 'heap-usage-self' ){
      message_to_client = JSON.stringify( {
        heap: {
          id: cluster.worker.id,
          pid: cluster.worker.process.pid,
          usage: Number( ( process.memoryUsage().rss / ( 1024 * 1024 ) ).toFixed( 2 ) ),
          wrk: 'control-room'
        }
      } );
      streaming.push( message_to_client );
    }

    if( typeof message[ 'control-room' ] === 'object' ){
    // every message from the master process will be sent to the client
    // this may come from different worker or master process
      if( message[ 'control-room' ]?.heap_usage ){

        message_to_client = JSON.stringify( {
          ...message[ 'control-room' ].heap_usage
        } );
        streaming.push( message_to_client );
      }
    }
  }

} );

function listeningListener(){

  const pid = cluster.worker.process.pid;
  const id = cluster.worker.id;
  const address = controlRoomConfig.hostname.magenta();
  const port = `:${controlRoomConfig.port.toString().yellow()}`;

  process.stdout.write( ` ${'|'.red()}${'   ctr'.red().underline()}(${ id }) ${pid} listening on ${ address }${ port }\n` );
}

async function listener( socket: Socket ){

  // not much happening here
  socket.on( 'data', ( _data ) => {} );

  socket.on( 'end', () => {
    process.stdout.write( 'Connection closed.\n' );
  } );

  socket.on( 'error', ( error ) => {
    process.stderr.write( error.message );
  } );

  // send data to the client every 1000ms
  // if there is data in the streaming array, send it to the client
  // and remove it from the array
  setInterval( () => {

    if( streaming.length > 0 ){
      socket.write( streaming.shift() );
    }
  }, 100 );
}
