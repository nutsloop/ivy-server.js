import type { Http2Server } from 'node:http2';

import { readFile } from 'node:fs/promises';
import { createSecureServer } from 'node:http2';

import { listen } from '../listen/listen.js';
import { listener } from '../listener.js';
import { RoutingHttp2IncomingMessage, RoutingHttp2ServerResponse } from '../routing.js';
import { catcher } from './exception/catcher.js';
import { destructuring_certs_path } from './shared/destructuring_certs_path.js';

export async function http2( port:number, address:string, certs_path: Map<'cert'|'dhparam'|'key', string> ): Promise<Http2Server> {

  const [ key_path, cert_path, dhparam_path ] = destructuring_certs_path( certs_path );

  const key = await readFile( key_path )
    .catch( catcher );
  const cert = await readFile( cert_path )
    .catch( catcher );
  const dhparam = await readFile( dhparam_path )
    .catch( catcher );

  if( ! ( key instanceof Error ) && ! ( cert instanceof Error ) && ! ( dhparam instanceof Error ) ){

    const http2_server: Http2Server = createSecureServer(
      {
        Http2ServerRequest: RoutingHttp2IncomingMessage,
        Http2ServerResponse: RoutingHttp2ServerResponse,
        cert: cert,
        dhparam: dhparam,
        keepAlive: true,
        key: key
      },
      // @ts-expect-error: @allowed
      listener,
    );

    // @ts-expect-error: @allowed
    listen( http2_server, port, address );

    http2_server.on( 'error', console.error );
    http2_server.on( 'sessionError', console.error );

    return http2_server;
  }

  if( key instanceof Error || cert instanceof Error || dhparam instanceof Error ){

    throw new Error( `secure server couldn't start because of certificates:

${ key instanceof Error ? key.message.red() : `OKENT: ${key_path} found`.green() }
${ '-'.repeat( 120 ).white() }
${ cert instanceof Error ? cert.message.red() : `OKENT: ${cert_path} found`.green() }
${ '-'.repeat( 120 ).white() }
${ dhparam instanceof Error ? dhparam.message.red() : `OKENT: ${dhparam_path} found`.green() }

` );
  }
}
