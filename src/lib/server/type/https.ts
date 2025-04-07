import type { Server } from 'node:https';
import type { Socket } from 'node:net';

import { createServer } from 'node:https';
import { inspect } from 'node:util';

import { listen } from '../listen/listen.js';
import { listener } from '../listener.js';
import { routing } from '../routing.js';
import { RoutingIncomingMessage } from '../routing/routing-incoming-message.js';
import { RoutingServerResponse } from '../routing/routing-server-response.js';
import { destructuring_certs_path } from './shared/destructuring_certs_path.js';

export async function https( port:number, address:string, certs_path: Map<'cert'|'dhparam'|'key', string> ): Promise<Server<
  typeof RoutingIncomingMessage,
  typeof RoutingServerResponse
>> {

  const [ key, cert, dhparam ] = await destructuring_certs_path( certs_path );

  const https_server = createServer<
      typeof RoutingIncomingMessage,
      typeof RoutingServerResponse
    >(
      {
        IncomingMessage: RoutingIncomingMessage,
        ServerResponse: RoutingServerResponse,
        cert: cert,
        dhparam: dhparam,
        keepAlive: true,
        key: key
      },
      listener,
    );

  listen( https_server, port, address );

  https_server.on( 'error', ( error ) => {
    console.trace( inspect( error, true, Infinity, true ) );
  } );

  https_server.on( 'clientError', ( error: Error & { code?: string }, socket: Socket ) => {

    if ( routing.get( 'mute-client-error' ) ){
      const ip = socket.remoteAddress ?? 'unknown';
      process.stderr.write( `{ ${`HTTPS`.white().strong()}: ${ error.code.magenta().underline().strong() }, ` );
      process.stderr.write( `${`error`.white().strong()}: ${error.message.underline().strong() }, ` );
      process.stderr.write( `${`ip_address`.white().strong()}: ${ip.red().underline().strong()} }\n` );
    }

  } );

  return https_server;

}

/*
 example of ALPNCallback.
  ALPNCallback: ( { servername, protocols } ) => {
  if( servername === 'api.nutsloop.dev' && protocols.includes( 'h2' ) ){
    return 'h2';
  }
  if( protocols.includes( 'http/1.1' ) ){
    return 'http/1.1';
  }
  return;
}*/
