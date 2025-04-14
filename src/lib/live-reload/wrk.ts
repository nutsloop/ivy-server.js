#!/usr/bin/env -S node

import { extends_proto } from '@nutsloop/ivy-ansi';
import { isValid } from '@nutsloop/ivy-cross-path';
import { watcher } from '@nutsloop/ivy-watcher';
import cluster from 'node:cluster';
import http from 'node:http';

extends_proto();

process.argv.splice( 0, 2 );
process.title = `ivy-sse(${ cluster.worker.id })`;

type sse_conf = Map<string, string | number>;

const sse_conf: sse_conf = new Map();

const argv = process.argv;

for ( let i = 0; i < argv.length; i += 2 ) {
  const key = argv[ i ];
  const value = key === 'port' ? Number( argv[ i + 1 ] ) : argv[ i + 1 ];
  sse_conf.set( key, value );
}

const host: string = sse_conf.get( 'host' ) as string;
const port: number = sse_conf.get( 'port' ) as number;
const cors_address = `http://${sse_conf.get( 'host' )}:${sse_conf.get( 'cors_port' )}`;

const clients = [];
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
