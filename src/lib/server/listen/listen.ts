import type { Server } from 'node:http';

import cluster from 'node:cluster';

import type { RoutingIncomingMessage } from '../routing/routing-incoming-message.js';
import type { RoutingServerResponse } from '../routing/routing-server-response.js';

import { routing } from '../routing.js';

export function listen( server: Server<typeof RoutingIncomingMessage, typeof RoutingServerResponse>, port: number, address: string ): void {

  server.listen( port, address, undefined, () => {
    if( cluster.isPrimary ){
      const host = routing.get( 'address' );
      const port = routing.get( 'port' );
      if ( host && port ) {
        process.stdout.write( ` ${'|'.red()}${'   ivy'.red().underline()}(0) ${process.pid}` );
        process.stdout.write( ` listening on ${ host.magenta() }:` );
        process.stdout.write( `${ port.toFixed().yellow() }\n` );
      }
    }
  } );
}
