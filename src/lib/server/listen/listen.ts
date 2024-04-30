import cluster from 'node:cluster';
import { Server } from 'node:http';

import { routing } from '../routing.js';

export function listen( server: Server, port: number, address: string ): void {

  server.listen( port, address, null, () => {
    if( cluster.isPrimary ){
      process.stdout.write( `ivy-server ${process.pid} listening on ${ routing.get( 'address' ).magenta() }:${ routing.get( 'port' ).toFixed().yellow() }\n` );
    }
  } );
}
