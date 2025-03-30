import cluster from 'node:cluster';
import { Server } from 'node:http';

import type { RoutingIncomingMessage } from '../routing/routing-incoming-message.js';
import type { RoutingServerResponse } from '../routing/routing-server-response.js';

import { routing } from '../routing.js';

export function listen( server: Server<typeof RoutingIncomingMessage, typeof RoutingServerResponse>, port: number, address: string ): void {

  server.listen( port, address, null, () => {
    if( cluster.isPrimary ){
      process.stdout.write( `ivy-server ${process.pid} listening on ${ routing.get( 'address' ).magenta() }:${ routing.get( 'port' ).toFixed().yellow() }\n` );
    }
  } );
}
