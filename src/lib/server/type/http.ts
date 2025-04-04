import type { Server } from 'node:http';
import type { Socket } from 'node:net';

import { createServer } from 'node:http';
import { inspect } from 'node:util';

import { listen } from '../listen/listen.js';
import { listener } from '../listener.js';
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
    const ip = socket.remoteAddress ?? 'unknown';
    process.stderr.write( `${'clientError'.bg_red().white()}\n` );
    process.stderr.write( `{ ${`HTTP`.white().strong()}: ${ error.code.magenta().underline().strong() }, ${`error`.white().strong()}: ${error.message.red() }\n` );
    process.stderr.write( `${ip.red().underline().strong()}\n` );
  } );

  return http_server;
}
