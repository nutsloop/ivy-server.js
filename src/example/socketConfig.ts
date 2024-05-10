import type { TLSSocket } from 'node:tls';

// @ts-expect-error: @allowed
import { type SocketConfig } from './index.js';

const config: SocketConfig = {
  hostname: '10.0.0.2',
  listener: listener,
  port: 38290,
  type: 'tls',
};

export default config;

async function listener( socket: TLSSocket ) {

  socket.setEncoding( 'utf8' );

  socket.on( 'data', async ( _data: string ) => {} );
}
