import type{ IncomingMessage, ServerResponse } from '../index.js';

import { type CreateServerOptions, IvyServer } from '../index.js';
const server = new IvyServer();
const config: CreateServerOptions = new Map();
config.set( 'port', 8080 );
config.set( 'address', '10.0.0.2' );
config.set( 'command', 'cluster' );
config.set( 'exec', `${process.cwd()}/example/server.js` );
config.set( 'log', null );
config.set( 'cpus', 4 );
config.set( 'ease-cluster', null );
config.set( 'routes', null );
config.set( 'log-persistent', 1 );
config.set( 'log-color', null );
await server.route( '/path', async( _req:IncomingMessage, res:ServerResponse ) => {
  res.writeHead( 200, { 'Content-Type': 'text/plain' } );
  res.write( 'Hello, World!' );
} );
server.create( config );
await server.start();
