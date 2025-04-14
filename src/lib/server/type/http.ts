import type { Server } from 'node:http';
import type { Socket } from 'node:net';

import { createServer } from 'node:http';
import { inspect } from 'node:util';

import { listen } from '../listen/listen.js';
import { listener } from '../listener.js';
import { routing } from '../routing.js';
import { RoutingIncomingMessage } from '../routing/routing-incoming-message.js';
import { RoutingServerResponse } from '../routing/routing-server-response.js';

export async function http( port: number, address: string ): Promise<Server<
  typeof RoutingIncomingMessage,
  typeof RoutingServerResponse
>> {

  const http_server = createServer<
    typeof RoutingIncomingMessage,
    typeof RoutingServerResponse
  >( {
    IncomingMessage: RoutingIncomingMessage,
    ServerResponse: RoutingServerResponse,
    keepAlive: true
  }, listener );

  listen( http_server, port, address );

  http_server.on( 'error', ( error ) => {
    console.trace( inspect( error, true, Infinity, true ) );
  } );

  http_server.on( 'clientError', ( error: Error & { code?: string }, socket: Socket ) => {

    if ( ! routing.get( 'mute-client-error' ) ){
      const ip = socket.remoteAddress ?? 'unknown';
      process.stderr.write( `{ ${`HTTP`.white().strong()}: ${ error.code.magenta().underline().strong() }, ` );
      process.stderr.write( `${`error`.white().strong()}: ${error.message.underline().strong() }, ` );
      process.stderr.write( `${`ip_address`.white().strong()}: ${ip.red().underline().strong()} }\n` );
    }
    socket.write( 'HTTP/1.1 400 Bad Request\r\n\r\n' );
    socket.end( '\r\n' );
    socket.destroy();

  } );

  return http_server;
}
