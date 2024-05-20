import type{ CreateServerOptions, IncomingMessage, ServerResponse } from '../index.js';

import { IvyServer } from '../index.js';

const server = new IvyServer();
const config: CreateServerOptions = new Map();

// set the server options
// the server will listen on port 8080
config.set( 'port', 8080 );
// the server will listen on address 10.0.0.2
config.set( 'address', '10.0.0.2' );
// the server will run in cluster mode
config.set( 'command', 'cluster' );
// the workers will be spawn using this very file
config.set( 'exec', `${process.cwd()}/example/server.js` );
// the server will log to stdout
config.set( 'log', null );
// the server will use 2 cpus
config.set( 'cpus', 2 );
// the server will use a socket
config.set( 'socket', 1 );
// the routes will be preload from the default directory (./routes)
config.set( 'routes', new Map( [ [ 'path', 'null' ], [ 'pre-load', 'true' ] ] ) );
// the server will log to persistent storage (./log/log.txt)
config.set( 'log-persistent', 1 );
// the server log will use colors to stdout
config.set( 'log-color', null );
// the control room will be spawn and active
config.set( 'control-room', null );

// define a route that responds with 'Hello, World!' to requests to /path
await server.route( '/path', async( _req:IncomingMessage, res:ServerResponse ) => {
  res.writeHead( 200, { 'Content-Type': 'text/plain' } );
  res.write( 'Hello, World!' );
} );

// create the server with the given options
server.create( config );

// start the server
await server.start();
