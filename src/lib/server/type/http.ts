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
    process.exit( 65 );
  } );

  http_server.on( 'clientError', ( error: Error, socket: Socket ) => {
    console.trace( {
      reason: 'clientError'.bg_red().white(),
      error: error.message.red(),
      remote_address: socket.remoteAddress.red().underline().strong()
    } );
  } );

  return http_server;
}
