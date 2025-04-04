import type { Server } from 'node:http';

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

  const http_instance = createServer<
    typeof RoutingIncomingMessage,
    typeof RoutingServerResponse
  >( {
    IncomingMessage: RoutingIncomingMessage,
    ServerResponse: RoutingServerResponse,
    keepAlive: true
  }, listener );

  listen( http_instance, port, address );

  http_instance.on( 'error', ( error ) => {
    console.trace( inspect( error, true, Infinity, true ) );
    process.exit( 65 );
  } );

  http_instance.on( 'clientError', ( error, socket ) => {
    console.trace( inspect( error, true, Infinity, true ) );
    socket.end( 'HTTP/1.1 400 Bad Request\r\n\r\n' );
  } );

  return http_instance;
}
