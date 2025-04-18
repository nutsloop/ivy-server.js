#!/usr/bin/env -S node
import { extends_proto } from '@nutsloop/ivy-ansi';
import cluster from 'node:cluster';

import type { LogConfig } from '../persistent.js';

extends_proto();

// Ensure we're in a worker context
if ( ! cluster.worker ) {
  console.error( 'This script must be run as a worker process' );
  process.exit( 1 );
}

// Type assertion to tell TypeScript that cluster.worker is defined
const worker = cluster.worker;

const process_id = [];
process_id.push( worker.process.pid );

process.title = `ivy-log(${ worker.id })`;
// splice the first two elements from the process.argv array
process.argv.splice( 0, 2 );

if( process.argv.length > 2 ){
  process.stderr.write( 'Too many arguments.\n' );
  process.exit( 1 );
}

const logConfigFile = process.argv[ 0 ];

const config = await import( logConfigFile ).then( module => module );
const exportedModule = Object.keys( config );
if( exportedModule.length === 0 ){

  console.log( 'logConfig.js doesn\'t have the "default" export.' );
  process.exit( 1 );
}
else if( exportedModule.length > 1 ){

  console.log( 'logConfig.js must have only the "default" export.' );
  process.exit( 1 );
}
else if( ! exportedModule.includes( 'default' ) ){

  console.log( 'logConfig.js doesn\'t have the "default" export' );
  process.exit( 1 );
}

const logConfig: LogConfig = config.default;

if( logConfig?.init ){

  if( logConfig.init.constructor.name === 'AsyncFunction' ){

    await logConfig.init( ...logConfig.init_args as unknown[] )
      // @ts-expect-error: @allowed
      .catch( console.error ) as Promise<void>;
  }
  else if( logConfig instanceof Function ){
    logConfig.init( ...logConfig.init_args as unknown[] );
  }
}

const control_room = process.argv[ 1 ] === 'true';

// if control room is enabled
if( control_room ){

  // ping control room socket every second
  // the control room will the send to the socket client memory usage.
  setInterval( () => {
    if ( process.send ) {
      process.send( { 'control-room':{
        heap_usage: {
          heap: {
            id: worker.id,
            pid: process.pid,
            usage: Number( ( process.memoryUsage().rss / ( 1024 * 1024 ) ).toFixed( 2 ) ),
            wrk: 'log'
          }
        }
      } } );
    }
  }, 500 );
}

process.on( 'message', async ( message: string[] ) => {

  if( logConfig.callback.constructor.name === 'AsyncFunction' ){
      await logConfig.callback( message )
        // @ts-expect-error: @allowed
        .catch( console.error ) as Promise<void>;
  }
  else {
    logConfig.callback( message );
  }
} );
