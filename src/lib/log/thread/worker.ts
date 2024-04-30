#!/usr/bin/env -S node

import cluster from 'node:cluster';

import { LogConfig } from '../persistent.js';

const process_id = [];
process_id.push( cluster.worker.process.pid );

process.title = `ivy-log-${ cluster.worker.id }`;
// splice the first two elements from the process.argv array
process.argv.splice( 0, 2 );

if( process.argv.length > 1 ){
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

if( logConfig?.init && typeof logConfig.init === 'function' ){
  await logConfig.init();
}

process.on( 'message', async ( message ) => {
  await logConfig.callback( message );
} );
