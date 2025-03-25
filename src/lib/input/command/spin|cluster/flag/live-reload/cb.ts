import type { CallBackFlagArgvData, CallBackFlagAsync } from '@nutsloop/ivy-input';

import { isValid } from '@ivy-industries/cross-path';
import { watcher } from '@nutsloop/ivy-watcher';
import cluster from 'node:cluster';
import { WebSocketServer } from 'ws';

import { routing } from '../../../../../server/routing.js';
type hot_routes_cb_data = Map<'host', string> &
  Map<'port', number>;
export const live_reload_cb: CallBackFlagAsync = async ( data: CallBackFlagArgvData<hot_routes_cb_data> ): Promise<void> => {

  routing.set( 'live-reload', true );

  const connection = {
    host: data?.get( 'host' ) || routing.get( 'address' ),
    port: data?.get( 'port' ) || 6553
  };

  if( cluster.isPrimary ){

    const webSocketServer: WebSocketServer = new WebSocketServer( connection );

    const path = await isValid( 'public' ).catch( ( error ) => {
      throw error;
    } );

    const watch = await watcher( path );
    watch.on( 'ready', async () => {
      console.log( 'watching'.red(), path.green() );
    } );

    watch.on( 'all', async ( path: string ) => {
      webSocketServer.clients.forEach( ( client ) => {
        client.send( JSON.stringify( {
          path,
          type: 'reload'
        } ) );
      } );
    } );
  }
};
