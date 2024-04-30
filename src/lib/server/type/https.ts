import type { Server } from 'node:https';

import { readFile } from 'node:fs/promises';
import { createServer } from 'node:https';

import { listen } from '../listen/listen.js';
import { listener } from '../listener.js';
import { RoutingIncomingMessage, RoutingServerResponse } from '../routing.js';
import { catcher } from './exception/catcher.js';
import { destructuring_certs_path } from './shared/destructuring_certs_path.js';

export async function https( port:number, address:string, certs_path: Map<'cert'|'dhparam'|'key', string> ): Promise<Server> {

  const [ key_path, cert_path, dhparam_path ] = destructuring_certs_path( certs_path );

  const key = await readFile( key_path )
    .catch( catcher );
  const cert = await readFile( cert_path )
    .catch( catcher );
  const dhparam = await readFile( dhparam_path )
    .catch( catcher );

  if( ! ( key instanceof Error ) && ! ( cert instanceof Error ) && ! ( dhparam instanceof Error ) ){

    const https_server: Server = createServer(
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

    https_server.on( 'error', console.error );

    return https_server;
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
