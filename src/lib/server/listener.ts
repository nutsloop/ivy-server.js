import type { IncomingMessage } from 'node:http';

import cluster from 'node:cluster';
import { randomUUID } from 'node:crypto';

import type {
  RequestData,
  Route,
  RoutingIncomingMessage,
  RoutingServerResponse
} from './routing.js';

import { crc } from '../function/crc.js';
import { uint8 } from '../function/uint8.js';
import { routing } from './routing.js';

export async function listener<K extends IncomingMessage>( IncomingMessage: RoutingIncomingMessage, ServerResponse: RoutingServerResponse<K> ): Promise<void> {

  IncomingMessage.set_ip_address();
  const data: RequestData = new Map();

  if( routing.get( 'served-by' ) ){
    ServerResponse.setHeader( 'served-by', routing.get( 'served-by-name' ) );
  }

  ServerResponse.wrk = cluster.worker?.id || 0;
  data.set( 'url_params', await IncomingMessage.get() );
  data.set( 'data', await IncomingMessage.post() );

  if( ServerResponse.log ){
    ServerResponse.bytesRead = IncomingMessage.socket.bytesRead;
    ServerResponse.incoming.set( 'data-error', '' );
    ServerResponse.incoming.set( 'id', await generate_id() );
    ServerResponse.incoming.set( 'ip_address', IncomingMessage.ip_address );
    ServerResponse.incoming.set( 'method', IncomingMessage.method );
    ServerResponse.incoming.set( 'url', IncomingMessage.url || 'unknown' );
    ServerResponse.incoming.set( 'httpVersion', IncomingMessage.httpVersion );
    ServerResponse.incoming.set( 'host', IncomingMessage.headers.host || <string>IncomingMessage.headers[ ':authority' ] );
    ServerResponse.incoming.set( 'user-agent', ServerResponse.user_agent( IncomingMessage.headers[ 'user-agent' ] ) );
    ServerResponse.incoming.set( 'referer', IncomingMessage.headers.referer || 'no-referer' );
    ServerResponse.incoming.set( 'time', new Date().toISOString() );
    ServerResponse.incoming.set( 'request', data );
  }

  if( ServerResponse.routes_active ){

    await IncomingMessage.route();

    if( typeof IncomingMessage.route_module === 'function' ){

      ServerResponse.isRoute = true;
      ServerResponse.route = IncomingMessage.route_module.bind( data ) as Route;
      await ServerResponse.sendRoute( IncomingMessage );

    }
  }

  if( ! ServerResponse.isRoute ){

    await ServerResponse.static( IncomingMessage.url.split( '?' )[ 0 ] );
  }

  ServerResponse.close();
}

async function generate_id(): Promise<string> {

  return crc( await uint8( randomUUID() ) )
    .catch( () => randomUUID().replace( /-/g, '' ).slice( 0, 8 ) );
}
