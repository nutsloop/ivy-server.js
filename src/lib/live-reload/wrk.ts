#!/usr/bin/env -S node

import { extends_proto } from '@nutsloop/ivy-ansi';
import { isValid } from '@nutsloop/ivy-cross-path';
import { watcher } from '@nutsloop/ivy-watcher';
import cluster from 'node:cluster';
import http from 'node:http';

import { LiveReloadConf } from '../server/routing.js';

extends_proto();

// Ensure we're in a worker context
if ( ! cluster.worker ) {
  console.error( 'This script must be run as a worker process' );
  process.exit( 1 );
}

// Type assertion to tell TypeScript that cluster.worker is defined
const worker = cluster.worker;

process.argv.splice( 0, 2 );
process.title = `ivy-sse(${ worker.id })`;

const sse_conf: LiveReloadConf = new Map();

type LiveReloadKey = 'cors_port' | 'host' | 'port';
const argv = process.argv as unknown as [LiveReloadKey, string, LiveReloadKey, string, LiveReloadKey, string];

for ( let i = 0; i < argv.length; i += 2 ) {
  const key = argv[ i ] as LiveReloadKey;
  const raw = argv[ i + 1 ];

  if ( key === 'port' ) {
    sse_conf.set( key, Number( raw ) );
  }
  else {
    sse_conf.set( key, raw );
  }
}

const host = sse_conf.get( 'host' );
const port = sse_conf.get( 'port' );
const cors_address = `http://${sse_conf.get( 'host' )}:${sse_conf.get( 'cors_port' )}`;

const clients: ( http.ServerResponse<http.IncomingMessage> & { req: http.IncomingMessage; } )[] = [];
const server = http.createServer( ( req, res ) => {
  if ( req.url === '/events' ) {
    res.writeHead( 200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': cors_address
    } );

    res.write( '\n' ); // trigger open
    clients.push( res );

    req.on( 'close', () => {
      const index = clients.indexOf( res );
      if ( index !== - 1 ) {
        clients.splice( index, 1 );
      }
    } );

    return;
  }

  res.writeHead( 404 );
  res.end();
} );

server.listen( port, host, () => {
  //process.stdout.write( ` ${'|'.red()}${'   SSE'.red().underline()} listening ${ host.magenta() }:${ port.toFixed().yellow() }\n` );
} );

const path = await isValid( 'public' ).catch( ( error ) => {
  throw error;
} );

const watch = await watcher( path );
watch.on( 'ready', async () => {
  console.log( 'watching'.red(), path.green() );
} );

watch.on( 'all', async ( path: string ) => {
  const payload = JSON.stringify( {
    path,
    type: 'reload'
  } );
  const message = `data: ${payload}\n\n`;
  clients.forEach( ( client ) => {
    client.write( message + '\n' );
  } );
} );
