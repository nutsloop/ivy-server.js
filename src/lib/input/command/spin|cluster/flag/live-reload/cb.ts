import type { CallBackFlagArgvData, CallBackFlagAsync } from '@nutsloop/ivy-input';

import { isValid } from '@nutsloop/ivy-cross-path';
import { watcher } from '@nutsloop/ivy-watcher';
import cluster from 'node:cluster';
import http from 'node:http';

import { routing } from '../../../../../server/routing.js';
type hot_routes_cb_data = Map<'host', string> &
  Map<'port', number>;
export const live_reload_cb: CallBackFlagAsync = async ( data: CallBackFlagArgvData<hot_routes_cb_data> ): Promise<void> => {

  routing.set( 'live-reload', true );

  const host:string = data?.get( 'host' ) || routing.get( 'address' );
  const port: number = data?.get( 'port' ) || 6553;
  const cors_address = `http://${routing.get( 'address' )}:${routing.get( 'port' )}`;

  if( cluster.isPrimary ){

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
      process.stdout.write( ` ${'|'.red()}${'   SSE'.red().underline()} listening ${ host.magenta() }:${ port.toFixed().yellow() }\n` );
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
  }
};
